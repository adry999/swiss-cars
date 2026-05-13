'use server';

import { createClient, createStaticClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/utils/requireAuth';
import { revalidatePath } from 'next/cache';

export async function getSettings(key: string) {
    const supabase = createStaticClient();
    const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

    if (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
    return data?.value || null;
}

export async function saveSettings(key: string, value: unknown) {
    await requireAuth();
    const supabase = await createClient();
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
