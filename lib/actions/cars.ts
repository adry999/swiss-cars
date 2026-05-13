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
        const { error: delError } = await supabase.from('car_images').delete().eq('car_id', savedId);
        if (delError) throw delError;

        const imagesToInsert = car_images.map(img => ({
            car_id: savedId,
            url: img.url,
            is_primary: img.is_primary,
        }));

        const { error: imgError } = await supabase.from('car_images').insert(imagesToInsert);
        if (imgError) throw imgError;
    }

    revalidatePath('/admin/inventory');
    revalidatePath('/[locale]/inventory', 'page');
    revalidatePath('/[locale]/inventory/[slug]', 'page');

    return { success: true, id: savedId };
}

export async function deleteCar(id: string) {
    await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/inventory');
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
