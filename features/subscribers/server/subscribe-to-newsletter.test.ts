// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RateLimiter } from '@core/rate-limit/rate-limiter';
import type { SubscribeOutcome } from '../subscribers.types';
import { createSubscribeToNewsletter, NEWSLETTER_SIGNUP_RATE_LIMIT } from './subscribe-to-newsletter';

const REQUESTER = { clientIp: '203.0.113.7' };

function setUpSubscription({
    withinRateLimit = true,
    subscribe = async () => 'subscribed',
}: {
    withinRateLimit?: boolean;
    subscribe?: (email: string) => Promise<SubscribeOutcome>;
} = {}) {
    const rateLimiter: RateLimiter = {
        consume: vi.fn(async () => ({ allowed: withinRateLimit, remaining: withinRateLimit ? 4 : 0, resetsAt: 0 })),
    };
    const subscribersRepository = { subscribe: vi.fn(subscribe) };

    const subscribeToNewsletter = createSubscribeToNewsletter({ subscribersRepository, rateLimiter });
    return { subscribeToNewsletter, rateLimiter, subscribersRepository };
}

describe('subscribeToNewsletter', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('subscribes a new address', async () => {
        const { subscribeToNewsletter, subscribersRepository } = setUpSubscription();

        const result = await subscribeToNewsletter('ana@example.md', REQUESTER);

        expect(result).toEqual({ status: 'succeeded' });
        expect(subscribersRepository.subscribe).toHaveBeenCalledWith('ana@example.md');
    });

    it('counts signups per client IP in the newsletter bucket', async () => {
        const { subscribeToNewsletter, rateLimiter } = setUpSubscription();

        await subscribeToNewsletter('ana@example.md', REQUESTER);

        expect(rateLimiter.consume).toHaveBeenCalledWith('subscribe:203.0.113.7', NEWSLETTER_SIGNUP_RATE_LIMIT);
    });

    it('turns away a client over the limit without touching the subscriber list', async () => {
        const { subscribeToNewsletter, subscribersRepository } = setUpSubscription({ withinRateLimit: false });

        const result = await subscribeToNewsletter('ana@example.md', REQUESTER);

        expect(result).toEqual({ status: 'rejected', reason: 'rate-limited' });
        expect(subscribersRepository.subscribe).not.toHaveBeenCalled();
    });

    it('rejects a malformed address', async () => {
        const { subscribeToNewsletter, subscribersRepository } = setUpSubscription();

        const result = await subscribeToNewsletter('not-an-email', REQUESTER);

        expect(result).toEqual({ status: 'rejected', reason: 'invalid-email' });
        expect(subscribersRepository.subscribe).not.toHaveBeenCalled();
    });

    it('tells an existing subscriber they are already on the list', async () => {
        const { subscribeToNewsletter } = setUpSubscription({ subscribe: async () => 'already_subscribed' });

        const result = await subscribeToNewsletter('ana@example.md', REQUESTER);

        expect(result).toEqual({ status: 'rejected', reason: 'already-subscribed' });
    });

    it('reports the signup as unavailable when the database fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { subscribeToNewsletter } = setUpSubscription({
            subscribe: async () => {
                throw new Error('Subscribers repository: subscribe_email failed: timeout');
            },
        });

        const result = await subscribeToNewsletter('ana@example.md', REQUESTER);

        expect(result).toEqual({ status: 'rejected', reason: 'unavailable' });
    });
});
