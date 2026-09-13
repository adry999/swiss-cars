import 'server-only';

import { requireAdmin } from '@shared/session/require-admin';
import { supabaseSubscribersRepository } from './server/supabase-subscribers-repository';
import type { Subscriber } from './subscribers.types';

// Not a Server Action: an export from a 'use server' file is a public POST endpoint, which would
// have turned the full subscriber email list into one protected only by requireAdmin() at call time.
export async function listSubscribers(): Promise<Subscriber[]> {
    await requireAdmin();
    return supabaseSubscribersRepository.list();
}
