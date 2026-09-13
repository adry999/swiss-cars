// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRateLimiter, type WindowUsage, type WindowUsageStore } from './rate-limiter';

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

function createRecordingStore() {
    const usageByKey = new Map<string, WindowUsage>();
    const writes: Array<{ key: string; usage: WindowUsage; ttlMs: number }> = [];
    const store: WindowUsageStore = {
        async read(key) {
            return usageByKey.get(key) ?? null;
        },
        async write(key, usage, ttlMs) {
            usageByKey.set(key, usage);
            writes.push({ key, usage, ttlMs });
        },
    };
    return { store, writes };
}

describe('createRateLimiter', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('allows requests up to the limit and counts down the remaining ones', async () => {
        const limiter = createRateLimiter({ store: null, now: createClock().now });

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
        const limiter = createRateLimiter({ store: null, now: clock.now });
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
        const limiter = createRateLimiter({ store: null, now: createClock().now });
        const singleRequest = { limit: 1, windowMs: 60_000 };

        await limiter.consume('lead:1.1.1.1', singleRequest);

        expect((await limiter.consume('lead:2.2.2.2', singleRequest)).allowed).toBe(true);
        expect((await limiter.consume('lead:1.1.1.1', singleRequest)).allowed).toBe(false);
    });

    it('persists usage in the shared store with a TTL matching the rest of the window', async () => {
        const clock = createClock();
        const { store, writes } = createRecordingStore();
        const limiter = createRateLimiter({ store, now: clock.now });

        await limiter.consume('lead:1.1.1.1', POLICY);
        clock.advance(20_000);
        await limiter.consume('lead:1.1.1.1', POLICY);

        expect(writes).toEqual([
            { key: 'lead:1.1.1.1', usage: { count: 1, resetsAt: 1_060_000 }, ttlMs: 60_000 },
            { key: 'lead:1.1.1.1', usage: { count: 2, resetsAt: 1_060_000 }, ttlMs: 40_000 },
        ]);
    });

    it('keeps limiting in memory when the shared store is unreachable', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const unreachableStore: WindowUsageStore = {
            read: async () => {
                throw new Error('ECONNRESET');
            },
            write: async () => {},
        };
        const limiter = createRateLimiter({ store: unreachableStore, now: createClock().now });
        const singleRequest = { limit: 1, windowMs: 60_000 };

        const first = await limiter.consume('lead:1.1.1.1', singleRequest);
        const second = await limiter.consume('lead:1.1.1.1', singleRequest);

        expect([first.allowed, second.allowed]).toEqual([true, false]);
        expect(console.error).toHaveBeenCalled();
    });
});
