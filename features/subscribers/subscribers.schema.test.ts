// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SubscriberEmailSchema } from './subscribers.schema';

describe('SubscriberEmailSchema', () => {
    it('accepts a normal email address', () => {
        const result = SubscriberEmailSchema.safeParse('customer@example.com');

        expect(result.success).toBe(true);
        expect(result.data).toBe('customer@example.com');
    });

    it('trims surrounding whitespace', () => {
        const result = SubscriberEmailSchema.safeParse('  customer@example.com  ');

        expect(result.success).toBe(true);
        expect(result.data).toBe('customer@example.com');
    });

    it('rejects a malformed address', () => {
        const result = SubscriberEmailSchema.safeParse('not-an-email');

        expect(result.success).toBe(false);
    });
});
