import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, getClientIp } from './rateLimit';

describe('checkRateLimit', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('should allow first request', async () => {
        const result = await checkRateLimit('test-1', { limit: 5, windowMs: 60000 });
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4);
    });

    it('should decrement remaining count on each request', async () => {
        const id = 'test-2';
        const options = { limit: 3, windowMs: 60000 };

        const r1 = await checkRateLimit(id, options);
        expect(r1.remaining).toBe(2);

        const r2 = await checkRateLimit(id, options);
        expect(r2.remaining).toBe(1);

        const r3 = await checkRateLimit(id, options);
        expect(r3.remaining).toBe(0);
    });

    it('should block requests after limit exceeded', async () => {
        const id = 'test-3';
        const options = { limit: 2, windowMs: 60000 };

        await checkRateLimit(id, options);
        await checkRateLimit(id, options);

        const blocked = await checkRateLimit(id, options);
        expect(blocked.success).toBe(false);
        expect(blocked.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
        const id = 'test-4';
        const options = { limit: 2, windowMs: 1000 };

        await checkRateLimit(id, options);
        await checkRateLimit(id, options);

        const blocked = await checkRateLimit(id, options);
        expect(blocked.success).toBe(false);

        vi.advanceTimersByTime(1500);

        const allowed = await checkRateLimit(id, options);
        expect(allowed.success).toBe(true);
        expect(allowed.remaining).toBe(1);
    });

    it('should track different identifiers separately', async () => {
        const options = { limit: 1, windowMs: 60000 };

        const r1 = await checkRateLimit('user-a', options);
        const r2 = await checkRateLimit('user-b', options);

        expect(r1.success).toBe(true);
        expect(r2.success).toBe(true);

        const r3 = await checkRateLimit('user-a', options);
        expect(r3.success).toBe(false);

        const r4 = await checkRateLimit('user-b', options);
        expect(r4.success).toBe(false);
    });
});

describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
        const request = new Request('http://localhost', {
            headers: {
                'x-forwarded-for': '192.168.1.1, 10.0.0.1',
            },
        });

        const ip = getClientIp(request);
        expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
        const request = new Request('http://localhost', {
            headers: {
                'x-real-ip': '10.0.0.5',
            },
        });

        const ip = getClientIp(request);
        expect(ip).toBe('10.0.0.5');
    });

    it('should prefer x-forwarded-for over x-real-ip', () => {
        const request = new Request('http://localhost', {
            headers: {
                'x-forwarded-for': '192.168.1.1',
                'x-real-ip': '10.0.0.5',
            },
        });

        const ip = getClientIp(request);
        expect(ip).toBe('192.168.1.1');
    });

    it('should return unknown when no IP headers present', () => {
        const request = new Request('http://localhost');

        const ip = getClientIp(request);
        expect(ip).toBe('unknown');
    });
});
