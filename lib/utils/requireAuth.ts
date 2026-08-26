'use server';

import { createClient } from '@/lib/supabase/server';
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
 * database/2026-08-26_admin_role.sql.
 */
export async function requireAuth(): Promise<User> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const role = (user.app_metadata as { role?: string } | undefined)?.role;
    if (role !== 'admin') {
        console.warn(`Forbidden: user ${user.id} has no admin role`);
        throw new Error('Forbidden');
    }

    return user;
}

/** Non-throwing variant for layouts that redirect instead of erroring. */
export async function isAdmin(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    return (user.app_metadata as { role?: string } | undefined)?.role === 'admin';
}
