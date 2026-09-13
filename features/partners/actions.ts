'use server';

import { createServerSupabaseClient } from '@core/supabase/server-client';
import { requireAuth } from '@/lib/utils/requireAuth';
import { PartnerSchema } from './partners.schema';
import { revalidatePath } from 'next/cache';

export async function savePartner(data: unknown) {
    await requireAuth();
    const supabase = await createServerSupabaseClient();

    const parsed = PartnerSchema.safeParse(data);
    if (!parsed.success) throw new Error('Invalid partner data');

    const { id, ...partnerData } = parsed.data;

    if (id) {
        const { error } = await supabase.from('partners').update(partnerData).eq('id', id);
        if (error) throw error;
    } else {
        const { error } = await supabase.from('partners').insert(partnerData);
        if (error) throw error;
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/partners');
    return { success: true };
}

export async function deletePartner(id: string) {
    await requireAuth();
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/', 'layout');
    revalidatePath('/admin/partners');
    return { success: true };
}
