export interface RateLimitPolicy {
    limit: number;
    windowMs: number;
}

export interface RateLimitDecision {
    allowed: boolean;
    remaining: number;
    resetsAt: number;
}

export interface RateLimiter {
    consume(key: string, policy: RateLimitPolicy): Promise<RateLimitDecision>;
}

export interface WindowUsage {
    count: number;
    resetsAt: number;
}

export interface WindowUsageStore {
    read(key: string): Promise<WindowUsage | null>;
    write(key: string, usage: WindowUsage, ttlMs: number): Promise<void>;
}

function countRequest(
    current: WindowUsage | null,
    policy: RateLimitPolicy,
    now: number,
): { decision: RateLimitDecision; nextUsage: WindowUsage | null } {
    if (!current || current.resetsAt <= now) {
        const nextUsage = { count: 1, resetsAt: now + policy.windowMs };
        return { nextUsage, decision: { allowed: true, remaining: policy.limit - 1, resetsAt: nextUsage.resetsAt } };
    }

    if (current.count >= policy.limit) {
        return { nextUsage: null, decision: { allowed: false, remaining: 0, resetsAt: current.resetsAt } };
    }

    const nextUsage = { count: current.count + 1, resetsAt: current.resetsAt };
    return {
        nextUsage,
        decision: { allowed: true, remaining: policy.limit - nextUsage.count, resetsAt: nextUsage.resetsAt },
    };
}

function createInMemoryWindowUsageStore(): WindowUsageStore {
    const usageByKey = new Map<string, WindowUsage>();

    return {
        async read(key) {
            return usageByKey.get(key) ?? null;
        },
        async write(key, usage) {
            usageByKey.set(key, usage);
        },
    };
}

/** Fixed-window limiter. Read-then-write is not atomic, so bursts can slightly exceed the limit. */
export function createRateLimiter({
    store,
    now = () => Date.now(),
}: {
    store: WindowUsageStore | null;
    now?: () => number;
}): RateLimiter {
    const inMemoryStore = createInMemoryWindowUsageStore();

    async function consumeFrom(usageStore: WindowUsageStore, key: string, policy: RateLimitPolicy) {
        const currentTime = now();
        const { decision, nextUsage } = countRequest(await usageStore.read(key), policy, currentTime);
        if (nextUsage) {
            await usageStore.write(key, nextUsage, nextUsage.resetsAt - currentTime);
        }
        return decision;
    }

    return {
        async consume(key, policy) {
            if (store) {
                try {
                    return await consumeFrom(store, key, policy);
                } catch (error) {
                    // An unreachable store must not block customers; each instance then limits on its own.
                    console.error('Rate limit store failed, limiting in memory:', error);
                }
            }
            return consumeFrom(inMemoryStore, key, policy);
        },
    };
}
