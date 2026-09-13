'use server';

import { createServerSupabaseClient } from '@core/supabase/server-client';
import { requireAdmin } from '@shared/session/require-admin';
import { revalidatePath } from 'next/cache';

// NOTE: reads live in `lib/settings` — a plain module, not a Server Action.
// Every export of a 'use server' file is a public POST endpoint, so exporting
// a settings reader here made the whole `site_config` row (including the
// Telegram bot token) fetchable by anyone.

export async function saveSettings(key: string, value: unknown) {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
        console.error('Error saving settings:', error);
        throw error;
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');
    return { success: true };
}
