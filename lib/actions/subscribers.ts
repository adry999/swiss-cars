'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/utils/requireAuth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type Subscriber = {
    id: string;
    email: string;
    is_active: boolean;
    subscribed_at: string;
    unsubscribed_at: string | null;
};

const EmailSchema = z.string().email();

export async function subscribe(email: string): Promise<{ success: boolean; error?: string }> {
    const result = EmailSchema.safeParse(email);
    if (!result.success) {
        return { success: false, error: 'Invalid email address' };
    }

    const supabase = await createClient();
    const normalizedEmail = email.toLowerCase();

    const { data: existing } = await supabase
        .from('subscribers')
        .select('id, is_active')
        .eq('email', normalizedEmail)
        .single();

    if (existing) {
        if (existing.is_active) {
            return { success: false, error: 'Already subscribed' };
        }
        const { error } = await supabase
            .from('subscribers')
            .update({ is_active: true, unsubscribed_at: null })
            .eq('id', existing.id);

        if (error) {
            return { success: false, error: 'Failed to resubscribe' };
        }
        return { success: true };
    }

    const { error } = await supabase
        .from('subscribers')
        .insert({ email: normalizedEmail });

    if (error) {
        console.error('Subscribe error:', error);
        return { success: false, error: 'Failed to subscribe' };
    }

    return { success: true };
}

export async function getSubscribers(): Promise<Subscriber[]> {
    await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

    if (error) {
        console.error('Get subscribers error:', error);
        return [];
    }

    return data || [];
}

export async function deleteSubscriber(id: string): Promise<{ success: boolean }> {
    await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Delete subscriber error:', error);
        return { success: false };
    }

    revalidatePath('/admin/subscribers');
    return { success: true };
}

export async function toggleSubscriberStatus(id: string, isActive: boolean): Promise<{ success: boolean }> {
    await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase
        .from('subscribers')
        .update({
            is_active: isActive,
            unsubscribed_at: isActive ? null : new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        console.error('Toggle subscriber error:', error);
        return { success: false };
    }

    revalidatePath('/admin/subscribers');
    return { success: true };
}
