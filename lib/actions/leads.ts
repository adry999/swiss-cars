'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/utils/requireAuth';
import { checkRateLimit } from '@/lib/utils/rateLimit';
import { revalidatePath } from 'next/cache';
import { sendTelegramNotification, sendEmailNotification } from '@/lib/utils/notifications';
import { getSettings } from './settings';
import { headers } from 'next/headers';
import { z } from 'zod';

const LeadInquirySchema = z.object({
    car_id: z.string().min(1, 'Eroare internă (ID mașină lipsă)'),
    car_name: z.string().min(1, 'Numele mașinii este obligatoriu').max(200),
    name: z.string().min(2, 'Numele trebuie să aibă minim 2 caractere').max(100),
    phone: z.string().min(7, 'Numărul de telefon trebuie să aibă minim 7 caractere').max(35, 'Numărul de telefon este prea lung'),
    email: z.string().email('Format email invalid').optional().or(z.literal('')),
    message: z.string().max(2000, 'Mesajul este prea lung').optional(),
    preferred_date: z.string().max(100).optional(),
    form_type: z.string().max(50).optional(),
    source_url: z.string().url().optional(),
});
export type LeadInquiry = {
    car_id: string;
    car_name: string;
    name: string;
    phone: string;
    email?: string;
    message?: string;
    preferred_date?: string;
    form_type?: string;
    source_url?: string;
};

export async function submitLeadInquiry(data: LeadInquiry) {
    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? h.get('x-real-ip') ?? 'unknown';
    const rateCheck = checkRateLimit(`lead:${ip}`, { limit: 5, windowMs: 60000 });

    if (!rateCheck.success) {
        return {
            success: false,
            error: 'Prea multe încercări. Te rugăm să aștepți un minut.',
            rateLimited: true
        };
    }

    const parsed = LeadInquirySchema.safeParse(data);
    if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const errorMsg = Object.entries(fieldErrors)
            .map(([field, msgs]) => `${field}: ${msgs?.join(', ')}`)
            .join(' | ');
        console.error('Validation failed for lead inquiry:', errorMsg, data);
        return { success: false, error: `Eroare date: ${errorMsg}` };
    }
    const validData = parsed.data;

    const supabase = await createClient();

    const { error } = await supabase.from('leads_inquiries').insert({
        car_id: validData.car_id,
        car_name: validData.car_name,
        name: validData.name,
        phone: validData.phone,
        email: validData.email || null,
        message: validData.message || null,
        preferred_date: validData.preferred_date || null,
        form_type: validData.form_type || 'inquiry',
        source_url: validData.source_url || null,
        created_at: new Date().toISOString(),
    });

    if (error) {
        console.error('Database insertion error:', error);
        return { success: false, error: `Eroare baze de date: ${error.message}` };
    }

    // Trigger notifications in background
    try {
        const settings = await getSettings('site_config');
        if (settings) {
            // Telegram
            if (settings.telegram_bot_token && settings.telegram_chat_id) {
                void sendTelegramNotification(
                    settings.telegram_bot_token,
                    settings.telegram_chat_id,
                    data
                );
            }
            // Email
            if (settings.notification_email) {
                void sendEmailNotification(
                    settings.notification_email,
                    data
                );
            }
        }
    } catch (notifyError) {
        console.error('Notification trigger error:', notifyError);
    }

    return { success: true };
}

export async function markLeadRead(id: string, is_read: boolean) {
    await requireAuth();
    const supabase = await createClient();
    const { error } = await supabase
        .from('leads_inquiries')
        .update({ is_read })
        .eq('id', id);

    if (error) {
        console.error('markLeadRead error:', error);
        return { success: false };
    }
    revalidatePath('/admin/leads');
    return { success: true };
}

export async function markLeadImportant(id: string, is_important: boolean) {
    await requireAuth();
    const supabase = await createClient();
    const { error } = await supabase
        .from('leads_inquiries')
        .update({ is_important })
        .eq('id', id);

    if (error) {
        console.error('markLeadImportant error:', error);
        return { success: false };
    }
    revalidatePath('/admin/leads');
    return { success: true };
}

export async function deleteLead(id: string) {
    await requireAuth();
    const supabase = await createClient();
    const { error } = await supabase
        .from('leads_inquiries')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('deleteLead error:', error);
        return { success: false };
    }
    revalidatePath('/admin/leads');
    return { success: true };
}

export async function markAllLeadsRead() {
    await requireAuth();
    const supabase = await createClient();
    const { error } = await supabase
        .from('leads_inquiries')
        .update({ is_read: true })
        .eq('is_read', false);

    if (error) {
        console.error('markAllLeadsRead error:', error);
        return { success: false };
    }
    revalidatePath('/admin/leads');
    return { success: true };
}
