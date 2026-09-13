import 'server-only';
import { createServerSupabaseClient, createStaticSupabaseClient } from '@core/supabase/server-client';
import type { Car, CarCatalogFilters, PaginatedCars } from '../inventory.types';
import { pickSimilarCars } from '../model/similar-cars';

export async function listAvailableCars(options?: CarCatalogFilters): Promise<Car[]> {
    const supabase = createStaticSupabaseClient();

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

export async function readCatalogPage(options?: CarCatalogFilters): Promise<PaginatedCars> {
    const page = options?.page || 1;
    const limit = options?.limit || 12;
    const offset = (page - 1) * limit;
    const availableOnly = options?.availableOnly !== false;

    const supabase = createStaticSupabaseClient();

    let countQuery = supabase
        .from('cars')
        .select('*', { count: 'exact', head: true });

    let dataQuery = supabase
        .from('cars')
        .select('*, car_images(*)')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (availableOnly) {
        countQuery = countQuery.eq('is_available', true);
        dataQuery = dataQuery.eq('is_available', true);
    }

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

export async function findCarBySlug(slug: string): Promise<Car | null> {
    const supabase = createStaticSupabaseClient();
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

/**
 * Cars related to the one being viewed: same brand first, then anything within
 * ±30% of its price.
 *
 * Queried directly rather than loading the whole public inventory and
 * filtering three rows out of it in memory.
 */
export async function findSimilarCars(options: {
    currentCarId: string;
    brand: string;
    price: number;
    limit?: number;
}): Promise<Car[]> {
    const { currentCarId, brand, price } = options;
    const limit = options.limit ?? 3;

    const supabase = createStaticSupabaseClient();

    const base = () =>
        supabase
            .from('cars')
            .select('*, car_images(*)')
            .eq('is_available', true)
            .neq('id', currentCarId)
            .order('created_at', { ascending: false })
            .limit(limit);

    let sameBrandCars: Car[] = [];
    if (brand) {
        const { data, error } = await base().ilike('brand', brand);
        if (error) console.error('Error fetching similar cars by brand:', error);
        sameBrandCars = (data as Car[] | null) ?? [];
    }

    let similarPriceCars: Car[] = [];
    if (sameBrandCars.length < limit && price > 0) {
        const { data, error } = await base()
            .gte('price', price * 0.7)
            .lte('price', price * 1.3);
        if (error) console.error('Error fetching similar cars by price:', error);
        similarPriceCars = (data as Car[] | null) ?? [];
    }

    return pickSimilarCars({ currentCarId, limit, sameBrandCars, similarPriceCars });
}

export async function listFeaturedCars(): Promise<Car[]> {
    const supabase = createStaticSupabaseClient();
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

export async function listCarSlugs(): Promise<string[]> {
    const supabase = createStaticSupabaseClient();
    const { data, error } = await supabase.from('cars').select('slug');

    if (error) {
        console.error('Error fetching car slugs:', error);
        return [];
    }
    return (data ?? []).map((row) => row.slug).filter((slug): slug is string => !!slug);
}

/**
 * The Supabase client here isn't wired to generated Database types, so
 * .select() returns an untyped row — matches the cast convention already
 * used throughout this repository.
 */
export async function findCarForEditing(carId: string): Promise<Car | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('cars')
        .select('*, car_images(*)')
        .eq('id', carId)
        .single();

    if (error || !data) return null;
    return data as Car;
}
