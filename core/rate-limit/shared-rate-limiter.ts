import 'server-only';
import { Redis } from '@upstash/redis';
import { getServerEnvironment } from '@config/server-environment';
import { createRateLimiter, type RateLimiter } from './rate-limiter';
import { createUpstashRateLimiter } from './upstash-rate-limiter';

let rateLimiter: RateLimiter | undefined;

/**
 * One limiter per server instance, shared by every public endpoint; callers keep their buckets apart with key prefixes.
 * Composed on first use, so builds and prerendered pages never need the Upstash secrets.
 */
export function getRateLimiter(): RateLimiter {
    if (!rateLimiter) {
        const { upstashRedis } = getServerEnvironment();
        const shared = upstashRedis
            ? createUpstashRateLimiter(new Redis({ url: upstashRedis.restUrl, token: upstashRedis.restToken }))
            : null;
        rateLimiter = createRateLimiter({ shared });
    }
    return rateLimiter;
}
