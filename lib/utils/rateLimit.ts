type RateLimitEntry = {
    count: number;
    resetTime: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (entry.resetTime < now) {
            rateLimitMap.delete(key);
        }
    }
}, 60000); // Clean up every minute

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

export function checkRateLimit(
    identifier: string,
    options: RateLimitOptions = { limit: 10, windowMs: 60000 }
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitMap.get(identifier);

    if (!entry || entry.resetTime < now) {
        const reset = now + options.windowMs;
        rateLimitMap.set(identifier, { count: 1, resetTime: reset });
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
