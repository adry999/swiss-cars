import 'server-only';
import { createServerSupabaseClient } from '@core/supabase/server-client';
import type { User } from '@supabase/supabase-js';

/** Every feature that needs to know who is signed in reads this, instead of importing the auth feature. */
export async function getCurrentUser(): Promise<User | null> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
