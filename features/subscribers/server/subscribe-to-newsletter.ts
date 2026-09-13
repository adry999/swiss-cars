import type { RateLimitPolicy, RateLimiter } from '@core/rate-limit/rate-limiter';
import { SubscriberEmailSchema } from '../subscribers.schema';
import type { SubscribersRepository, SubscriptionResult } from '../subscribers.types';

export const NEWSLETTER_SIGNUP_RATE_LIMIT: RateLimitPolicy = { limit: 5, windowMs: 10 * 60_000 };

export type SubscribeToNewsletter = (email: unknown, requester: { clientIp: string }) => Promise<SubscriptionResult>;

export function createSubscribeToNewsletter({
    subscribersRepository,
    rateLimiter,
}: {
    subscribersRepository: Pick<SubscribersRepository, 'subscribe'>;
    rateLimiter: RateLimiter;
}): SubscribeToNewsletter {
    return async function subscribeToNewsletter(email, requester) {
        // Counted before validation, so probing with malformed addresses spends the same budget.
        const rateLimit = await rateLimiter.consume(`subscribe:${requester.clientIp}`, NEWSLETTER_SIGNUP_RATE_LIMIT);
        if (!rateLimit.allowed) return { status: 'rejected', reason: 'rate-limited' };

        const parsed = SubscriberEmailSchema.safeParse(email);
        if (!parsed.success) return { status: 'rejected', reason: 'invalid-email' };

        try {
            const outcome = await subscribersRepository.subscribe(parsed.data);
            if (outcome === 'already_subscribed') return { status: 'rejected', reason: 'already-subscribed' };
            return { status: 'succeeded' };
        } catch (error) {
            console.error('Subscribe failed:', error);
            return { status: 'rejected', reason: 'unavailable' };
        }
    };
}
