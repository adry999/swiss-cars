import 'server-only';
import { createServerSupabaseClient } from '@core/supabase/server-client';
import type { CarImageInput, CarRecord } from '../inventory.types';
import { deleteStorageObjects } from './car-image-storage';

function throwOnDatabaseError(operation: string, { error }: { error: { message: string } | null }) {
    if (error) {
        throw new Error(`Car admin repository: ${operation} failed: ${error.message}`, { cause: error });
    }
}

export async function saveCarWithImages(car: CarRecord, images?: CarImageInput[]): Promise<string> {
    const supabase = await createServerSupabaseClient();
    const { id: carId, ...carFields } = car;

    let savedId = carId;
    if (savedId) {
        throwOnDatabaseError('update car', await supabase.from('cars').update(carFields).eq('id', savedId));
    } else {
        const inserted = await supabase.from('cars').insert(carFields).select().single();
        throwOnDatabaseError('insert car', inserted);
        savedId = inserted.data.id;
    }

    if (images && savedId) {
        const { data: existing, error: existingError } = await supabase
            .from('car_images')
            .select('id, url')
            .eq('car_id', savedId);
        throwOnDatabaseError('read existing images', { error: existingError });

        if ((existing ?? []).length > 0) {
            throwOnDatabaseError(
                'clear primary flags',
                await supabase.from('car_images').update({ is_primary: false }).eq('car_id', savedId),
            );
        }

        const imagesToInsert = images.map((img, index) => ({
            car_id: savedId,
            url: img.url,
            is_primary: img.is_primary,
            sort_order: index,
        }));

        if (imagesToInsert.length > 0) {
            throwOnDatabaseError('insert images', await supabase.from('car_images').insert(imagesToInsert));
        }

        const staleIds = (existing ?? []).map((row) => row.id);
        if (staleIds.length > 0) {
            throwOnDatabaseError('delete stale images', await supabase.from('car_images').delete().in('id', staleIds));
        }

        const keptUrls = new Set(images.map((img) => img.url));
        const removedUrls = (existing ?? []).map((row) => row.url).filter((url) => !keptUrls.has(url));
        await deleteStorageObjects(supabase, removedUrls);
    }

    return savedId as string;
}

export async function deleteCarWithImages(carId: string): Promise<void> {
    const supabase = await createServerSupabaseClient();

    const { data: images } = await supabase.from('car_images').select('url').eq('car_id', carId);

    throwOnDatabaseError('delete car', await supabase.from('cars').delete().eq('id', carId));

    await deleteStorageObjects(supabase, (images ?? []).map((row) => row.url));
}

export async function duplicateCarWithImages(carId: string): Promise<string | null> {
    const supabase = await createServerSupabaseClient();

    const { data: car, error: carError } = await supabase
        .from('cars')
        .select('*, car_images(*)')
        .eq('id', carId)
        .single();

    if (carError || !car) return null;

    const { id, created_at, updated_at, car_images, ...carData } = car;

    const clonedCar = {
        ...carData,
        slug: `${carData.slug}-${Date.now()}`,
        is_available: true,
    };

    const inserted = await supabase.from('cars').insert(clonedCar).select().single();
    throwOnDatabaseError('insert duplicated car', inserted);
    const newCarId = inserted.data.id as string;

    if (car_images && car_images.length > 0) {
        const imagesToInsert = (car_images as CarImageInput[]).map((img) => ({
            car_id: newCarId,
            url: img.url,
            is_primary: img.is_primary,
        }));

        throwOnDatabaseError('insert duplicated images', await supabase.from('car_images').insert(imagesToInsert));
    }

    return newCarId;
}

export async function countCars(): Promise<{ total: number; available: number }> {
    const supabase = await createServerSupabaseClient();
    const [totalResult, availableResult] = await Promise.all([
        supabase.from('cars').select('*', { count: 'exact', head: true }),
        supabase.from('cars').select('*', { count: 'exact', head: true }).eq('is_available', true),
    ]);

    throwOnDatabaseError('count cars', totalResult);
    throwOnDatabaseError('count available cars', availableResult);

    return { total: totalResult.count ?? 0, available: availableResult.count ?? 0 };
}
