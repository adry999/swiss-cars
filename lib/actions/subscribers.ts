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

    // subscribe_email() (database/2026-08-26_lead_subscriber_rpc.sql) does the
    // existing-row lookup and insert-or-reactivate as one SECURITY DEFINER
    // call. The previous version did a SELECT as anon to check for an
    // existing subscriber, but anon never had a SELECT policy on this table,
    // so that lookup always came back empty — a duplicate signup fell
    // through to INSERT, hit the unique constraint, and surfaced as a
    // generic "Failed to subscribe" instead of "Already subscribed".
    const { data, error } = await supabase.rpc('subscribe_email', { p_email: email });

    if (error) {
        console.error('Subscribe error:', error);
        return { success: false, error: 'Failed to subscribe' };
    }

    if (data === 'already_subscribed') {
        return { success: false, error: 'Already subscribed' };
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
