'use server';

import { createServerSupabaseClient } from '@core/supabase/server-client';
import { requireAuth } from '@/lib/utils/requireAuth';
import { ReviewSchema } from './reviews.schema';
import { revalidatePath } from 'next/cache';

export async function saveReview(data: unknown) {
    await requireAuth();
    const supabase = await createServerSupabaseClient();

    const parsed = ReviewSchema.safeParse(data);
    if (!parsed.success) throw new Error('Invalid review data');

    const { id, ...reviewData } = parsed.data;

    if (id) {
        const { error } = await supabase.from('reviews').update(reviewData).eq('id', id);
        if (error) throw error;
    } else {
        const { error } = await supabase.from('reviews').insert(reviewData);
        if (error) throw error;
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/reviews');
    return { success: true };
}

export async function deleteReview(id: string) {
    await requireAuth();
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/', 'layout');
    revalidatePath('/admin/reviews');
    return { success: true };
}
