import { Ratelimit } from '@upstash/ratelimit';
import type { Redis } from '@upstash/redis';
import type { RateLimitPolicy, RateLimiter } from './rate-limiter';

const KEY_PREFIX = 'rate-limit';
const REDIS_TIMEOUT_MS = 1_000;

/** Fixed window counted atomically in Redis, so concurrent requests from one client cannot exceed the limit. */
export function createUpstashRateLimiter(redis: Redis): RateLimiter {
    const limitersByPolicy = new Map<string, Ratelimit>();

    function limiterFor(policy: RateLimitPolicy): Ratelimit {
        const policyKey = `${policy.limit}/${policy.windowMs}`;
        let limiter = limitersByPolicy.get(policyKey);
        if (!limiter) {
            limiter = new Ratelimit({
                redis,
                limiter: Ratelimit.fixedWindow(policy.limit, `${policy.windowMs} ms`),
                prefix: KEY_PREFIX,
                timeout: REDIS_TIMEOUT_MS,
            });
            limitersByPolicy.set(policyKey, limiter);
        }
        return limiter;
    }

    return {
        async consume(key, policy) {
            const response = await limiterFor(policy).limit(key);
            // On timeout the library lets the request through unlimited; failing here hands it to the in-memory fallback.
            if (response.reason === 'timeout') {
                throw new Error(`Upstash rate limit check timed out after ${REDIS_TIMEOUT_MS} ms`);
            }
            return { allowed: response.success, remaining: Math.max(0, response.remaining), resetsAt: response.reset };
        },
    };
}
