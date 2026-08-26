'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/utils/requireAuth';
import { revalidatePath } from 'next/cache';
import { CarSchema, type Car } from '@/lib/types';

type CarWithImages = Car & { car_images?: { url: string; is_primary: boolean }[] };

const CAR_COLUMNS = [
    'slug', 'brand', 'model', 'year', 'price', 'mileage', 'fuel_type',
    'transmission', 'engine_cc', 'color_exterior', 'color_interior',
    'body_type', 'drive', 'seats', 'is_featured', 'is_available',
    'description', 'features',
] as const;

function pickCarColumns(raw: Car): Pick<Car, typeof CAR_COLUMNS[number]> {
    return Object.fromEntries(CAR_COLUMNS.map(k => [k, raw[k]])) as Pick<Car, typeof CAR_COLUMNS[number]>;
}

const STORAGE_BUCKET = 'car-images';

/** Maps a public storage URL back to its object path, or null if it isn't one. */
function storagePathFromUrl(url: string): string | null {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const index = url.indexOf(marker);
    if (index === -1) return null;
    const path = url.slice(index + marker.length).split('?')[0];
    return path ? decodeURIComponent(path) : null;
}

/**
 * Best-effort removal of storage objects.
 *
 * Deliberately non-fatal: an orphaned file is a cost problem, a thrown error
 * here would be a broken admin save.
 */
async function deleteStorageObjects(
    supabase: Awaited<ReturnType<typeof createClient>>,
    urls: string[]
): Promise<void> {
    const candidates = [...new Set(urls)].filter(url => storagePathFromUrl(url) !== null);
    if (candidates.length === 0) return;

    // duplicateCar() copies image URLs rather than the files, so two cars can
    // point at the same object. Only delete what nothing references any more.
    const { data: stillReferenced, error: refError } = await supabase
        .from('car_images')
        .select('url')
        .in('url', candidates);

    if (refError) {
        console.error('Skipping storage cleanup, reference check failed:', refError);
        return;
    }

    const referenced = new Set((stillReferenced ?? []).map(row => row.url));
    const paths = candidates
        .filter(url => !referenced.has(url))
        .map(storagePathFromUrl)
        .filter((path): path is string => path !== null);

    if (paths.length === 0) return;

    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);
    if (error) console.error('Failed to remove storage objects:', error, paths);
}

export async function saveCar(carData: CarWithImages) {
    await requireAuth();
    const supabase = await createClient();

    const parsed = CarSchema.safeParse(carData);
    if (!parsed.success) throw new Error('Invalid car data');

    const { car_images, id: carId, ...rawCar } = parsed.data as CarWithImages & { id?: string };
    const car = pickCarColumns(rawCar as Car);

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
        // Insert the new rows BEFORE removing the old ones. The previous order
        // (delete-all, then insert) left the car with zero images whenever the
        // insert failed. This is still not a transaction — see
        // database/2026-08-26_security_hardening.sql section 6 — but a failure
        // now leaves the previous images in place instead of destroying them.
        const { data: existing, error: existingError } = await supabase
            .from('car_images')
            .select('id, url')
            .eq('car_id', savedId);
        if (existingError) throw existingError;

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

        // Drop storage objects for images the admin removed, otherwise every
        // edit leaves files in the bucket forever.
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
    const supabase = await createClient();

    // Read the image URLs first: the car_images rows disappear via ON DELETE
    // CASCADE, but the storage objects they point at do not.
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
    const supabase = await createClient();

    const { data: car, error: carError } = await supabase
        .from('cars')
        .select('*, car_images(*)')
        .eq('id', id)
        .single();

    if (carError || !car) throw new Error('Car not found');

    const { id: _oldId, created_at: _ca, updated_at: _ua, car_images, ...rawCar } = car;

    const clonedCar = {
        ...pickCarColumns(rawCar as Car),
        slug: `${rawCar.slug}-${Date.now()}`,
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
