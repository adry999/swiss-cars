import type { Redis } from '@upstash/redis';
import type { WindowUsage, WindowUsageStore } from './rate-limiter';

const KEY_PREFIX = 'rate-limit:';

/** @upstash/redis serializes and parses JSON itself, so usage is stored as a plain object. */
export function createUpstashWindowUsageStore(redis: Redis): WindowUsageStore {
    return {
        async read(key) {
            return redis.get<WindowUsage>(`${KEY_PREFIX}${key}`);
        },
        async write(key, usage, ttlMs) {
            await redis.set(`${KEY_PREFIX}${key}`, usage, { px: Math.max(1, Math.ceil(ttlMs)) });
        },
    };
}
