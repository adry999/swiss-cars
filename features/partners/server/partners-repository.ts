import { createServerSupabaseClient, createStaticSupabaseClient } from '@core/supabase/server-client';
import type { Partner } from '../partners.types';

export async function listVisiblePartners(): Promise<Partner[]> {
    const supabase = createStaticSupabaseClient();
    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order');

    if (error) {
        console.error('Error fetching partners:', error);
        return [];
    }
    return data as Partner[];
}

/** Admin list: includes hidden partners, so they can be made visible again. */
export async function listAllPartners(): Promise<Partner[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from('partners').select('*').order('sort_order');

    if (error) {
        throw new Error(`Partners repository: list all partners failed: ${error.message}`, { cause: error });
    }
    return data as Partner[];
}

export async function findPartnerForEditing(partnerId: string): Promise<Partner | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', partnerId)
        .single();

    if (error || !data) return null;
    return data as Partner;
}
