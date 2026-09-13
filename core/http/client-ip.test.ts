import { describe, expect, it } from 'vitest';
import { readClientIp, UNKNOWN_CLIENT_IP } from './client-ip';

describe('readClientIp', () => {
    it('takes the first address of x-forwarded-for', () => {
        const headers = new Headers({ 'x-forwarded-for': '192.168.1.1, 10.0.0.1' });

        expect(readClientIp(headers)).toBe('192.168.1.1');
    });

    it('falls back to x-real-ip', () => {
        const headers = new Headers({ 'x-real-ip': '10.0.0.5' });

        expect(readClientIp(headers)).toBe('10.0.0.5');
    });

    it('prefers x-forwarded-for over x-real-ip', () => {
        const headers = new Headers({ 'x-forwarded-for': '192.168.1.1', 'x-real-ip': '10.0.0.5' });

        expect(readClientIp(headers)).toBe('192.168.1.1');
    });

    it('reports an unknown client when no address header is present', () => {
        expect(readClientIp(new Headers())).toBe(UNKNOWN_CLIENT_IP);
    });
});
