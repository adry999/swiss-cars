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

interface RateLimitOptions {
    /** Maximum number of requests allowed within the window */
    limit: number;
    /** Time window in milliseconds */
    windowMs: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * Simple in-memory rate limiter.
 * For production with multiple servers, use Redis-based rate limiting.
 */
export function checkRateLimit(
    identifier: string,
    options: RateLimitOptions = { limit: 10, windowMs: 60000 }
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitMap.get(identifier);

    if (!entry || entry.resetTime < now) {
        // First request or window expired
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + options.windowMs,
        });
        return {
            success: true,
            remaining: options.limit - 1,
            resetTime: now + options.windowMs,
        };
    }

    if (entry.count >= options.limit) {
        // Rate limit exceeded
        return {
            success: false,
            remaining: 0,
            resetTime: entry.resetTime,
        };
    }

    // Increment count
    entry.count++;
    return {
        success: true,
        remaining: options.limit - entry.count,
        resetTime: entry.resetTime,
    };
}

/**
 * Get client IP from request headers.
 * Handles X-Forwarded-For for proxied requests.
 */
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
