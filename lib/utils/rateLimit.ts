import { Redis } from '@upstash/redis';

export const LEAD_RATE_LIMIT = { limit: 5, windowMs: 60000 } as const;

interface RateLimitOptions {
    limit: number;
    windowMs: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
}

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

type RateLimitEntry = { count: number; resetTime: number };
const fallbackMap = new Map<string, RateLimitEntry>();

export async function checkRateLimit(
    identifier: string,
    options: RateLimitOptions = { limit: 10, windowMs: 60000 }
): Promise<RateLimitResult> {
    const now = Date.now();
    const key = `rate:${identifier}`;

    if (redis) {
        try {
            const stored = await redis.get<string>(key);
            const entry = stored ? JSON.parse(stored) : null;

            if (!entry || entry.resetTime < now) {
                const reset = now + options.windowMs;
                const newEntry = { count: 1, resetTime: reset };
                await redis.setex(key, Math.ceil(options.windowMs / 1000), JSON.stringify(newEntry));
                return { success: true, remaining: options.limit - 1, resetTime: reset };
            }

            if (entry.count >= options.limit) {
                return { success: false, remaining: 0, resetTime: entry.resetTime };
            }

            entry.count++;
            await redis.setex(key, Math.ceil((entry.resetTime - now) / 1000), JSON.stringify(entry));
            return { success: true, remaining: options.limit - entry.count, resetTime: entry.resetTime };
        } catch (error) {
            console.error('Redis rate limit error, falling back to memory:', error);
        }
    }

    const entry = fallbackMap.get(identifier);
    if (!entry || entry.resetTime < now) {
        const reset = now + options.windowMs;
        fallbackMap.set(identifier, { count: 1, resetTime: reset });
        return { success: true, remaining: options.limit - 1, resetTime: reset };
    }

    if (entry.count >= options.limit) {
        return { success: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return { success: true, remaining: options.limit - entry.count, resetTime: entry.resetTime };
}

export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    return 'unknown';
}
