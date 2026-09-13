import { createBrowserClient } from '@supabase/ssr';
import { getPublicEnvironment } from '@config/public-environment';

export function createBrowserSupabaseClient() {
    const { supabase } = getPublicEnvironment();
    return createBrowserClient(supabase.url, supabase.anonKey);
}
