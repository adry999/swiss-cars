import { createServerSupabaseClient, createStaticSupabaseClient } from '@core/supabase/server-client';
import { type Review, type Partner } from '../types';
import type { Lead } from '@features/leads';

const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key'
);

export interface PaginatedResult<T> {
    data: T[];
    totalCount: number;
    page: number;
    totalPages: number;
}

export async function getReviews(): Promise<Review[]> {
    if (!isSupabaseConfigured) return [];
    const supabase = createStaticSupabaseClient();
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
    return data as Review[];
}

export async function getAllReviewsPaginated(options?: {
    page?: number;
    limit?: number;
}): Promise<PaginatedResult<Review>> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    if (!isSupabaseConfigured) {
        return { data: [], totalCount: 0, page, totalPages: 0 };
    }

    const supabase = await createServerSupabaseClient();

    const [countResult, dataResult] = await Promise.all([
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1),
    ]);

    if (countResult.error || dataResult.error) {
        console.error('Error fetching reviews:', countResult.error || dataResult.error);
        return { data: [], totalCount: 0, page, totalPages: 0 };
    }

    const totalCount = countResult.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
        data: dataResult.data as Review[],
        totalCount,
        page,
        totalPages,
    };
}

export async function getPartners(): Promise<Partner[]> {
    if (!isSupabaseConfigured) return [];
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
