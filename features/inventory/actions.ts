'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@shared/session/require-admin';
import { CarSchema } from './inventory.schema';
import type { CarDuplicationResult, CarRemovalResult, CarSaveResult } from './inventory.types';
import { deleteCarWithImages, duplicateCarWithImages, saveCarWithImages } from './server/car-admin-repository';

const CarIdSchema = z.uuid();

function revalidateCatalog() {
    revalidatePath('/admin/inventory');
    revalidatePath('/[locale]/inventory', 'page');
    revalidatePath('/[locale]/inventory/[slug]', 'page');
}

export async function saveCar(carData: unknown): Promise<CarSaveResult> {
    await requireAdmin();

    const parsed = CarSchema.safeParse(carData);
    if (!parsed.success) {
        return {
            status: 'rejected',
            reason: 'invalid-input',
            invalidFields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? 'car')))],
        };
    }

    const { car_images, created_at, ...car } = parsed.data;

    try {
        await saveCarWithImages(car, car_images);
    } catch (error) {
        console.error('Save car failed:', error);
        return { status: 'rejected', reason: 'unavailable' };
    }

    revalidateCatalog();
    return { status: 'succeeded' };
}

export async function deleteCar(carId: string): Promise<CarRemovalResult> {
    await requireAdmin();
    if (!CarIdSchema.safeParse(carId).success) {
        return { status: 'rejected', reason: 'invalid-input' };
    }

    try {
        await deleteCarWithImages(carId);
    } catch (error) {
        console.error('Delete car failed:', error);
        return { status: 'rejected', reason: 'unavailable' };
    }

    revalidatePath('/admin/inventory');
    revalidatePath('/[locale]/inventory', 'page');
    return { status: 'succeeded' };
}

export async function duplicateCar(carId: string): Promise<CarDuplicationResult> {
    await requireAdmin();
    if (!CarIdSchema.safeParse(carId).success) {
        return { status: 'rejected', reason: 'invalid-input' };
    }

    let newCarId: string | null;
    try {
        newCarId = await duplicateCarWithImages(carId);
    } catch (error) {
        console.error('Duplicate car failed:', error);
        return { status: 'rejected', reason: 'unavailable' };
    }

    if (!newCarId) return { status: 'rejected', reason: 'not-found' };

    revalidatePath('/admin/inventory');
    return { status: 'succeeded' };
}
