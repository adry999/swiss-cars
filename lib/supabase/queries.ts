import { createClient, createStaticClient } from './server';
import { type Car, type Review, type Partner } from '../types';

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

export async function getCars(options?: {
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
}): Promise<Car[]> {
    if (!isSupabaseConfigured) return [];
    const supabase = createStaticClient();

    let query = supabase
        .from('cars')
        .select('*, car_images(*)')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

    if (options?.brand && options.brand !== 'all') {
        query = query.ilike('brand', options.brand);
    }
    if (options?.minPrice) query = query.gte('price', options.minPrice);
    if (options?.maxPrice) query = query.lte('price', options.maxPrice);
    if (options?.minYear) query = query.gte('year', options.minYear);
    if (options?.maxYear) query = query.lte('year', options.maxYear);

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching cars:', error);
        return [];
    }
    return data as Car[];
}

export async function getCarsPaginated(options?: {
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    page?: number;
    limit?: number;
    availableOnly?: boolean; // true for public pages, false for admin
}): Promise<PaginatedResult<Car>> {
    const page = options?.page || 1;
    const limit = options?.limit || 12;
    const offset = (page - 1) * limit;
    const availableOnly = options?.availableOnly !== false; // default true

    if (!isSupabaseConfigured) {
        return { data: [], totalCount: 0, page, totalPages: 0 };
    }

    const supabase = createStaticClient();

    // Build base query for count
    let countQuery = supabase
        .from('cars')
        .select('*', { count: 'exact', head: true });

    // Build data query
    let dataQuery = supabase
        .from('cars')
        .select('*, car_images(*)')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    // Filter by availability if requested
    if (availableOnly) {
        countQuery = countQuery.eq('is_available', true);
        dataQuery = dataQuery.eq('is_available', true);
    }

    // Apply filters to both queries
    if (options?.brand && options.brand !== 'all') {
        countQuery = countQuery.ilike('brand', options.brand);
        dataQuery = dataQuery.ilike('brand', options.brand);
    }
    if (options?.minPrice) {
        countQuery = countQuery.gte('price', options.minPrice);
        dataQuery = dataQuery.gte('price', options.minPrice);
    }
    if (options?.maxPrice) {
        countQuery = countQuery.lte('price', options.maxPrice);
        dataQuery = dataQuery.lte('price', options.maxPrice);
    }
    if (options?.minYear) {
        countQuery = countQuery.gte('year', options.minYear);
        dataQuery = dataQuery.gte('year', options.minYear);
    }
    if (options?.maxYear) {
        countQuery = countQuery.lte('year', options.maxYear);
        dataQuery = dataQuery.lte('year', options.maxYear);
    }

    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (countResult.error || dataResult.error) {
        console.error('Error fetching paginated cars:', countResult.error || dataResult.error);
        return { data: [], totalCount: 0, page, totalPages: 0 };
    }

    const totalCount = countResult.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
        data: dataResult.data as Car[],
        totalCount,
        page,
        totalPages,
    };
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
    if (!isSupabaseConfigured) return null;
    const supabase = createStaticClient();
    const { data, error } = await supabase
        .from('cars')
        .select('*, car_images(*)')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching car:', error);
        return null;
    }
    return data as Car;
}

export async function getReviews(): Promise<Review[]> {
    if (!isSupabaseConfigured) return [];
    const supabase = createStaticClient();
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

    const supabase = await createClient();

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
    const supabase = createStaticClient();
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

/**
 * @deprecated Use getCarsPaginated with availableOnly: false instead
 */
export async function getAllCarsPaginated(options?: {
    page?: number;
    limit?: number;
}): Promise<PaginatedResult<Car>> {
    return getCarsPaginated({
        page: options?.page,
        limit: options?.limit || 20,
        availableOnly: false,
    });
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

    const supabase = await createClient();

    // Optimized: 4 queries instead of 6
    // Fetch minimal data for cars/leads and count in-memory
    const [
        carsResult,
        leadsResult,
        reviewsResult,
        partnersResult,
    ] = await Promise.all([
        supabase.from('cars').select('is_available'),
        supabase.from('leads_inquiries').select('is_read'),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('partners').select('*', { count: 'exact', head: true }),
    ]);

    const cars = carsResult.data || [];
    const leads = leadsResult.data || [];

    const totalCars = cars.length;
    const availableCars = cars.filter(c => c.is_available).length;
    const totalLeads = leads.length;
    const unreadLeads = leads.filter(l => !l.is_read).length;

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

export async function getRecentLeads(limit: number = 5) {
    if (!isSupabaseConfigured) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('leads_inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching recent leads:', error);
        return [];
    }

    return data;
}

export async function getFeaturedCars(): Promise<Car[]> {
    if (!isSupabaseConfigured) return [];
    const supabase = createStaticClient();
    const { data, error } = await supabase
        .from('cars')
        .select('*, car_images(*)')
        .eq('is_available', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

    if (error) {
        console.error('Error fetching featured cars:', error);
        return [];
    }
    return data as Car[];
}
