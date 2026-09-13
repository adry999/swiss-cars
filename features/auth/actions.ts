'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@core/supabase/server-client';
import type { ActionResult } from '@shared/contracts/action-result';
import { AdminCredentialsSchema, type AdminCredentials } from './auth.schema';

export type SignInResult = ActionResult<'invalid-input' | 'invalid-credentials'>;

export async function signIn(credentials: AdminCredentials): Promise<SignInResult> {
    const parsed = AdminCredentialsSchema.safeParse(credentials);
    if (!parsed.success) return { status: 'rejected', reason: 'invalid-input' };

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    // Supabase's own message ("Invalid login credentials") is never returned to the client;
    // the client maps `invalid-credentials` to its own translated copy.
    if (error) return { status: 'rejected', reason: 'invalid-credentials' };

    revalidatePath('/admin', 'layout');
    return { status: 'succeeded' };
}

export async function signOut() {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    revalidatePath('/admin', 'layout');
    redirect('/login');
}
