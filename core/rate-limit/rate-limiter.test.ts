// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInMemoryRateLimiter, createRateLimiter, type RateLimiter } from './rate-limiter';

const POLICY = { limit: 3, windowMs: 60_000 };

function createClock(startsAt = 1_000_000) {
    let currentTime = startsAt;
    return {
        now: () => currentTime,
        advance: (milliseconds: number) => {
            currentTime += milliseconds;
        },
    };
}

describe('createInMemoryRateLimiter', () => {
    it('allows requests up to the limit and counts down the remaining ones', async () => {
        const limiter = createInMemoryRateLimiter({ now: createClock().now });

        const decisions = [
            await limiter.consume('lead:1.1.1.1', POLICY),
            await limiter.consume('lead:1.1.1.1', POLICY),
            await limiter.consume('lead:1.1.1.1', POLICY),
        ];

        expect(decisions.map((decision) => [decision.allowed, decision.remaining])).toEqual([
            [true, 2],
            [true, 1],
            [true, 0],
        ]);
    });

    it('blocks requests beyond the limit until the window ends', async () => {
        const clock = createClock();
        const limiter = createInMemoryRateLimiter({ now: clock.now });
        for (let request = 0; request < POLICY.limit; request++) {
            await limiter.consume('lead:1.1.1.1', POLICY);
        }

        const blocked = await limiter.consume('lead:1.1.1.1', POLICY);
        clock.advance(POLICY.windowMs);
        const afterWindow = await limiter.consume('lead:1.1.1.1', POLICY);

        expect(blocked).toEqual({ allowed: false, remaining: 0, resetsAt: 1_000_000 + POLICY.windowMs });
        expect(afterWindow).toMatchObject({ allowed: true, remaining: 2 });
    });

    it('limits each key independently', async () => {
        const limiter = createInMemoryRateLimiter({ now: createClock().now });
        const singleRequest = { limit: 1, windowMs: 60_000 };

        await limiter.consume('lead:1.1.1.1', singleRequest);

        expect((await limiter.consume('lead:2.2.2.2', singleRequest)).allowed).toBe(true);
        expect((await limiter.consume('lead:1.1.1.1', singleRequest)).allowed).toBe(false);
    });

    it('forgets expired windows once it tracks too many clients', async () => {
        const clock = createClock();
        const limiter = createInMemoryRateLimiter({ now: clock.now, maxTrackedKeys: 2 });
        const singleRequest = { limit: 1, windowMs: 60_000 };
        await limiter.consume('lead:1.1.1.1', singleRequest);
        await limiter.consume('lead:2.2.2.2', singleRequest);

        clock.advance(singleRequest.windowMs);
        await limiter.consume('lead:3.3.3.3', singleRequest);
        clock.advance(-singleRequest.windowMs);

        // Had the expired window survived the sweep, a rewound clock would still see it as used.
        expect((await limiter.consume('lead:1.1.1.1', singleRequest)).allowed).toBe(true);
    });

    it('keeps windows that are still running when it sweeps', async () => {
        const clock = createClock();
        const limiter = createInMemoryRateLimiter({ now: clock.now, maxTrackedKeys: 2 });
        const singleRequest = { limit: 1, windowMs: 60_000 };
        await limiter.consume('lead:1.1.1.1', singleRequest);
        await limiter.consume('lead:2.2.2.2', singleRequest);

        await limiter.consume('lead:3.3.3.3', singleRequest);

        expect((await limiter.consume('lead:1.1.1.1', singleRequest)).allowed).toBe(false);
    });
});

describe('createRateLimiter', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('follows the shared limiter while it answers', async () => {
        const shared: RateLimiter = {
            consume: vi.fn(async () => ({ allowed: false, remaining: 0, resetsAt: 1_060_000 })),
        };
        const fallback: RateLimiter = { consume: vi.fn() };
        const limiter = createRateLimiter({ shared, fallback });

        const decision = await limiter.consume('lead:1.1.1.1', POLICY);

        expect(decision).toEqual({ allowed: false, remaining: 0, resetsAt: 1_060_000 });
        expect(shared.consume).toHaveBeenCalledWith('lead:1.1.1.1', POLICY);
        expect(fallback.consume).not.toHaveBeenCalled();
    });

    it('keeps limiting in memory when the shared limiter is unreachable', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const unreachable: RateLimiter = {
            consume: async () => {
                throw new Error('ECONNRESET');
            },
        };
        const limiter = createRateLimiter({
            shared: unreachable,
            fallback: createInMemoryRateLimiter({ now: createClock().now }),
        });
        const singleRequest = { limit: 1, windowMs: 60_000 };

        const first = await limiter.consume('lead:1.1.1.1', singleRequest);
        const second = await limiter.consume('lead:1.1.1.1', singleRequest);

        expect([first.allowed, second.allowed]).toEqual([true, false]);
        expect(console.error).toHaveBeenCalled();
    });

    it('limits in memory when no shared limiter is configured', async () => {
        const limiter = createRateLimiter({ shared: null });
        const singleRequest = { limit: 1, windowMs: 60_000 };

        await limiter.consume('subscribe:1.1.1.1', singleRequest);

        expect((await limiter.consume('subscribe:1.1.1.1', singleRequest)).allowed).toBe(false);
    });
});
