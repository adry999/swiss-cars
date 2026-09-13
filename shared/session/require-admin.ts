import 'server-only';
import { createServerSupabaseClient } from '@core/supabase/server-client';
import { hasAdminRole } from '@shared/session/admin-role';
import type { User } from '@supabase/supabase-js';

/**
 * Authorization gate for every mutation Server Action.
 *
 * A signed-in user is NOT automatically an administrator. Without the role
 * check below, any account in the Supabase project — a leftover test user, a
 * self-signup, a compromised non-admin — could edit or delete every car,
 * review, partner, lead, subscriber and settings value.
 *
 * Grant access in the Supabase dashboard (Authentication → Users → the user →
 * "User Metadata" → app_metadata), or via the Admin API:
 *
 *   supabase.auth.admin.updateUserById(id, { app_metadata: { role: 'admin' } })
 *
 * `app_metadata` is signed into the JWT and cannot be modified by the user,
 * unlike `user_metadata`. The matching RLS policies live in
 * database/2026-08-26_security_hardening.sql.
 */
export async function requireAdmin(): Promise<User> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (hasAdminRole(user)) {
        return user;
    }

    if (!user) {
        throw new Error('Unauthorized');
    }

    // At this point, user is narrowed to User (by the negative type guard)
    const authenticatedUser = user as User;
    console.warn(`Forbidden: user ${authenticatedUser.id} has no admin role`);
    throw new Error('Forbidden');
}
