'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/utils/requireAuth';
import { checkRateLimit, LEAD_RATE_LIMIT } from '@/lib/utils/rateLimit';
import { LeadInquirySchema, type LeadInquiry } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { sendTelegramNotification, sendEmailNotification } from '@/lib/utils/notifications';
import { getNotificationConfig } from '@/lib/settings';
import { headers } from 'next/headers';

export async function submitLeadInquiry(data: LeadInquiry) {
    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? h.get('x-real-ip') ?? 'unknown';
    const rateCheck = checkRateLimit(`lead:${ip}`, LEAD_RATE_LIMIT);

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

    // Routed through the submit_lead() RPC rather than a direct .insert() —
    // see database/2026-08-26_lead_subscriber_rpc.sql. A direct insert
    // policy for anon would let anyone bypass this Zod validation and the
    // rate limiter above by calling the Supabase REST API with the public
    // anon key.
    const { error } = await supabase.rpc('submit_lead', {
        p_car_id: validData.car_id,
        p_car_name: validData.car_name,
        p_name: validData.name,
        p_phone: validData.phone,
        p_email: validData.email || null,
        p_message: validData.message || null,
        p_preferred_date: validData.preferred_date || null,
        p_form_type: validData.form_type || 'inquiry',
        p_source_url: validData.source_url || null,
    });

    if (error) {
        // Log the driver error, but never surface it — it leaks schema details.
        console.error('Database insertion error:', error);
        return { success: false, error: 'Nu am putut salva cererea. Te rugăm să încerci din nou.' };
    }

    // Notifications are awaited: a serverless function can terminate before a
    // floating promise resolves, silently dropping the alert.
    try {
        const notify = await getNotificationConfig();

        await Promise.allSettled([
            notify.telegramBotToken && notify.telegramChatId
                ? sendTelegramNotification(notify.telegramBotToken, notify.telegramChatId, validData)
                : Promise.resolve(),
            notify.notificationEmail
                ? sendEmailNotification(notify.notificationEmail, validData)
                : Promise.resolve(),
        ]);
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
