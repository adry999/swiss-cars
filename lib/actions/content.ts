'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/utils/requireAuth';
import { ReviewSchema, PartnerSchema } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function saveReview(data: unknown) {
    await requireAuth();
    const supabase = await createClient();

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

export async function savePartner(data: unknown) {
    await requireAuth();
    const supabase = await createClient();

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

export async function deleteReview(id: string) {
    await requireAuth();
    const supabase = await createClient();
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/', 'layout');
    revalidatePath('/admin/reviews');
    return { success: true };
}

export async function deletePartner(id: string) {
    await requireAuth();
    const supabase = await createClient();
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/', 'layout');
    revalidatePath('/admin/partners');
    return { success: true };
}
