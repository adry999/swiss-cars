'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@shared/session/require-admin';
import { SubscriberEmailSchema } from './subscribers.schema';
import type { SubscriberChangeResult, SubscriptionResult } from './subscribers.types';
import { supabaseSubscribersRepository } from './server/supabase-subscribers-repository';

const SubscriberIdSchema = z.uuid();

export async function subscribe(email: string): Promise<SubscriptionResult> {
    const parsed = SubscriberEmailSchema.safeParse(email);
    if (!parsed.success) return { status: 'rejected', reason: 'invalid-email' };

    try {
        const outcome = await supabaseSubscribersRepository.subscribe(parsed.data);
        if (outcome === 'already_subscribed') return { status: 'rejected', reason: 'already-subscribed' };
        return { status: 'succeeded' };
    } catch (error) {
        console.error('Subscribe failed:', error);
        return { status: 'rejected', reason: 'unavailable' };
    }
}

const invalidInput: SubscriberChangeResult = { status: 'rejected', reason: 'invalid-input' };

async function changeSubscriber(change: () => Promise<void>): Promise<SubscriberChangeResult> {
    try {
        await change();
    } catch (error) {
        console.error('Subscriber change failed:', error);
        return { status: 'rejected', reason: 'unavailable' };
    }

    revalidatePath('/admin/subscribers');
    return { status: 'succeeded' };
}

export async function deleteSubscriber(subscriberId: string): Promise<SubscriberChangeResult> {
    await requireAdmin();
    if (!SubscriberIdSchema.safeParse(subscriberId).success) return invalidInput;

    return changeSubscriber(() => supabaseSubscribersRepository.remove(subscriberId));
}

export async function toggleSubscriberStatus(subscriberId: string, isActive: boolean): Promise<SubscriberChangeResult> {
    await requireAdmin();
    if (!SubscriberIdSchema.safeParse(subscriberId).success || typeof isActive !== 'boolean') return invalidInput;

    return changeSubscriber(() => supabaseSubscribersRepository.setActive(subscriberId, isActive));
}
