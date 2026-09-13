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

interface WindowUsage {
    count: number;
    resetsAt: number;
}

const DEFAULT_MAX_TRACKED_KEYS = 10_000;

function countRequest(
    current: WindowUsage | undefined,
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

/**
 * Fixed-window limiter that only sees the requests reaching this server instance.
 * Long-lived instances would otherwise keep one entry per client IP forever, so expired windows are
 * swept whenever the map reaches `maxTrackedKeys`.
 */
export function createInMemoryRateLimiter({
    now = () => Date.now(),
    maxTrackedKeys = DEFAULT_MAX_TRACKED_KEYS,
}: { now?: () => number; maxTrackedKeys?: number } = {}): RateLimiter {
    const usageByKey = new Map<string, WindowUsage>();

    function removeExpiredWindows(currentTime: number) {
        for (const [key, usage] of usageByKey) {
            if (usage.resetsAt <= currentTime) {
                usageByKey.delete(key);
            }
        }
    }

    return {
        async consume(key, policy) {
            const currentTime = now();
            if (usageByKey.size >= maxTrackedKeys && !usageByKey.has(key)) {
                removeExpiredWindows(currentTime);
            }

            const { decision, nextUsage } = countRequest(usageByKey.get(key), policy, currentTime);
            if (nextUsage) {
                usageByKey.set(key, nextUsage);
            }
            return decision;
        },
    };
}

export function createRateLimiter({
    shared,
    fallback = createInMemoryRateLimiter(),
}: {
    shared: RateLimiter | null;
    fallback?: RateLimiter;
}): RateLimiter {
    return {
        async consume(key, policy) {
            if (shared) {
                try {
                    return await shared.consume(key, policy);
                } catch (error) {
                    // An unreachable store must not block customers; each instance then limits on its own.
                    console.error('Shared rate limiter failed, limiting in memory:', error);
                }
            }
            return fallback.consume(key, policy);
        },
    };
}
