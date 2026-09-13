// @vitest-environment node
import type { User } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { hasAdminRole } from './admin-role';

function buildUser(metadata: Pick<User, 'app_metadata' | 'user_metadata'>): User {
    return {
        id: '0b8f2c1e-9d4a-4f6b-8e3c-2a1d5f7b9c60',
        aud: 'authenticated',
        created_at: '2026-09-13T09:30:00.000Z',
        ...metadata,
    };
}

describe('hasAdminRole', () => {
    it('accepts a user whose signed app_metadata grants the admin role', () => {
        expect(hasAdminRole(buildUser({ app_metadata: { role: 'admin' }, user_metadata: {} }))).toBe(true);
    });

    it('rejects a signed-in user without the admin role', () => {
        expect(hasAdminRole(buildUser({ app_metadata: {}, user_metadata: {} }))).toBe(false);
    });

    it('ignores an admin role the user wrote into their own user_metadata', () => {
        expect(hasAdminRole(buildUser({ app_metadata: {}, user_metadata: { role: 'admin' } }))).toBe(false);
    });

    it('rejects an anonymous visitor', () => {
        expect(hasAdminRole(null)).toBe(false);
    });
});
