// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { AdminCredentialsSchema } from './auth.schema';

describe('AdminCredentialsSchema', () => {
    it('accepts valid credentials', () => {
        const result = AdminCredentialsSchema.safeParse({
            email: 'admin@swisscars.md',
            password: 'secret123',
        });

        expect(result.success).toBe(true);
    });

    it('rejects a malformed email', () => {
        const result = AdminCredentialsSchema.safeParse({
            email: 'not-an-email',
            password: 'secret123',
        });

        expect(result.success).toBe(false);
    });

    it('rejects a password shorter than 6 characters', () => {
        const result = AdminCredentialsSchema.safeParse({
            email: 'admin@swisscars.md',
            password: 'short',
        });

        expect(result.success).toBe(false);
    });
});
