'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@core/supabase/server-client';
import { requireAuth } from '@/lib/utils/requireAuth';
import { CarSchema } from './inventory.schema';
import type { Car } from './inventory.types';
import { deleteStorageObjects } from './server/car-image-storage';

type CarWithImages = Car & { car_images?: { url: string; is_primary: boolean }[] };

export async function saveCar(carData: CarWithImages) {
    await requireAuth();
    const supabase = await createServerSupabaseClient();

    const parsed = CarSchema.safeParse(carData);
    if (!parsed.success) throw new Error('Invalid car data');

    const { car_images, id: carId, created_at, ...car } = parsed.data as CarWithImages & { id?: string };

    let savedId = carId;
    if (savedId) {
        const { error } = await supabase.from('cars').update(car).eq('id', savedId);
        if (error) throw error;
    } else {
        const { data, error } = await supabase.from('cars').insert(car).select().single();
        if (error) throw error;
        savedId = data.id;
    }

    if (car_images && savedId) {
        const { data: existing, error: existingError } = await supabase
            .from('car_images')
            .select('id, url')
            .eq('car_id', savedId);
        if (existingError) throw existingError;

        if ((existing ?? []).length > 0) {
            const { error: clearError } = await supabase
                .from('car_images')
                .update({ is_primary: false })
                .eq('car_id', savedId);
            if (clearError) throw clearError;
        }

        const imagesToInsert = car_images.map((img, index) => ({
            car_id: savedId,
            url: img.url,
            is_primary: img.is_primary,
            sort_order: index,
        }));

        if (imagesToInsert.length > 0) {
            const { error: imgError } = await supabase.from('car_images').insert(imagesToInsert);
            if (imgError) throw imgError;
        }

        const staleIds = (existing ?? []).map(row => row.id);
        if (staleIds.length > 0) {
            const { error: delError } = await supabase
                .from('car_images')
                .delete()
                .in('id', staleIds);
            if (delError) throw delError;
        }

        const keptUrls = new Set(car_images.map(img => img.url));
        const removedUrls = (existing ?? [])
            .map(row => row.url)
            .filter(url => !keptUrls.has(url));
        await deleteStorageObjects(supabase, removedUrls);
    }

    revalidatePath('/admin/inventory');
    revalidatePath('/[locale]/inventory', 'page');
    revalidatePath('/[locale]/inventory/[slug]', 'page');

    return { success: true, id: savedId };
}

export async function deleteCar(id: string) {
    await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { data: images } = await supabase
        .from('car_images')
        .select('url')
        .eq('car_id', id);

    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (error) throw error;

    await deleteStorageObjects(supabase, (images ?? []).map(row => row.url));

    revalidatePath('/admin/inventory');
    revalidatePath('/[locale]/inventory', 'page');
    return { success: true };
}

export async function duplicateCar(id: string) {
    await requireAuth();
    const supabase = await createServerSupabaseClient();

    const { data: car, error: carError } = await supabase
        .from('cars')
        .select('*, car_images(*)')
        .eq('id', id)
        .single();

    if (carError || !car) throw new Error('Car not found');

    const { id: _, created_at, updated_at, car_images, ...carData } = car;

    const clonedCar = {
        ...carData,
        slug: `${carData.slug}-${Date.now()}`,
        is_available: true,
    };

    const { data: newCar, error: insertError } = await supabase
        .from('cars')
        .insert(clonedCar)
        .select()
        .single();

    if (insertError) throw insertError;

    if (car_images && car_images.length > 0) {
        const imagesToInsert = (car_images as { url: string; is_primary: boolean }[]).map(img => ({
            car_id: newCar.id,
            url: img.url,
            is_primary: img.is_primary,
        }));

        const { error: imgError } = await supabase.from('car_images').insert(imagesToInsert);
        if (imgError) throw imgError;
    }

    revalidatePath('/admin/inventory');
    return { success: true, id: newCar.id };
}
