import type { User } from '@supabase/supabase-js';

/**
 * Being signed in is not being an admin: any account in the Supabase project could otherwise reach the
 * admin shell. `app_metadata` is signed into the JWT and cannot be edited by the user, unlike `user_metadata`.
 */
export function hasAdminRole(user: User | null): user is User {
    return (user?.app_metadata as { role?: string } | undefined)?.role === 'admin';
}
