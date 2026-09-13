import { createServerSupabaseClient, createStaticSupabaseClient } from '@core/supabase/server-client';
import type { PaginatedReviews, Review } from '../reviews.types';

export async function listVisibleReviews(): Promise<Review[]> {
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

export async function readReviewsAdminPage(options?: {
    page?: number;
    limit?: number;
}): Promise<PaginatedReviews> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

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

export async function findReviewForEditing(reviewId: string): Promise<Review | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

    if (error || !data) return null;
    return data as Review;
}
