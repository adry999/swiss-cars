import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getPublicEnvironment } from '@config/public-environment';

/** Acts as the signed-in user, so RLS policies apply. */
export async function createServerSupabaseClient() {
    const { supabase } = getPublicEnvironment();
    const cookieStore = await cookies();

    return createServerClient(supabase.url, supabase.anonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // Server Components cannot write cookies; proxy.ts refreshes the session on /admin requests.
                }
            },
        },
    });
}

/** Cookie-free anonymous client for generateStaticParams, the sitemap and cached public reads. */
export function createStaticSupabaseClient() {
    const { supabase } = getPublicEnvironment();
    return createClient(supabase.url, supabase.anonKey);
}
