'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { readClientIp } from '@core/http/client-ip';
import { getRateLimiter } from '@core/rate-limit/shared-rate-limiter';
import { requireAdmin } from '@shared/session/require-admin';
import type { SubscriberChangeResult, SubscriptionResult } from './subscribers.types';
import { supabaseSubscribersRepository } from './server/supabase-subscribers-repository';
import { createSubscribeToNewsletter, type SubscribeToNewsletter } from './server/subscribe-to-newsletter';

const SubscriberIdSchema = z.uuid();

let subscribeToNewsletter: SubscribeToNewsletter | undefined;

export async function subscribe(email: string): Promise<SubscriptionResult> {
    subscribeToNewsletter ??= createSubscribeToNewsletter({
        subscribersRepository: supabaseSubscribersRepository,
        rateLimiter: getRateLimiter(),
    });
    return subscribeToNewsletter(email, { clientIp: readClientIp(await headers()) });
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
