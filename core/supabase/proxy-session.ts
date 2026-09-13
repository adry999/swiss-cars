import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { getPublicEnvironment } from '@config/public-environment';

export interface RefreshedSession {
    /** Carries the refreshed auth cookies; return it unless redirecting. */
    response: NextResponse;
    user: User | null;
}

export async function refreshSupabaseSession(request: NextRequest): Promise<RefreshedSession> {
    const { supabase: credentials } = getPublicEnvironment();
    let response = NextResponse.next({ request });

    const supabase = createServerClient(credentials.url, credentials.anonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
            },
        },
    });

    // getUser() revalidates the token with Supabase Auth, which is what refreshes an expired session.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return { response, user };
}
