import { createServerSupabaseClient } from '@core/supabase/server-client';
import type { Lead } from '@features/leads';

const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key'
);

// Dashboard Stats
export interface DashboardStats {
    totalCars: number;
    availableCars: number;
    soldCars: number;
    totalLeads: number;
    unreadLeads: number;
    totalReviews: number;
    totalPartners: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    if (!isSupabaseConfigured) {
        return {
            totalCars: 0,
            availableCars: 0,
            soldCars: 0,
            totalLeads: 0,
            unreadLeads: 0,
            totalReviews: 0,
            totalPartners: 0,
        };
    }

    const supabase = await createServerSupabaseClient();

    // Counted in the database. This previously fetched every car row and every
    // lead row and counted them in JS, which grows with the table.
    const countOnly = { count: 'exact' as const, head: true };

    const [
        totalCarsResult,
        availableCarsResult,
        totalLeadsResult,
        unreadLeadsResult,
        reviewsResult,
        partnersResult,
    ] = await Promise.all([
        supabase.from('cars').select('*', countOnly),
        supabase.from('cars').select('*', countOnly).eq('is_available', true),
        supabase.from('leads_inquiries').select('*', countOnly),
        supabase.from('leads_inquiries').select('*', countOnly).eq('is_read', false),
        supabase.from('reviews').select('*', countOnly),
        supabase.from('partners').select('*', countOnly),
    ]);

    const totalCars = totalCarsResult.count || 0;
    const availableCars = availableCarsResult.count || 0;
    const totalLeads = totalLeadsResult.count || 0;
    const unreadLeads = unreadLeadsResult.count || 0;

    return {
        totalCars,
        availableCars,
        soldCars: totalCars - availableCars,
        totalLeads,
        unreadLeads,
        totalReviews: reviewsResult.count || 0,
        totalPartners: partnersResult.count || 0,
    };
}

export async function getRecentLeads(limit: number = 5): Promise<Lead[]> {
    if (!isSupabaseConfigured) return [];

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('leads_inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching recent leads:', error);
        return [];
    }

    // The Supabase client here isn't wired to generated Database types.
    return data as Lead[];
}
