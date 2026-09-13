import type { z } from 'zod';
import type { ActionResult } from '@shared/contracts/action-result';
import type { CarSchema } from './inventory.schema';

export type Car = z.infer<typeof CarSchema>;

/** A car row without the fields the admin repository manages separately (images) or never writes (created_at). */
export type CarRecord = Omit<Car, 'car_images' | 'created_at'>;
export type CarImageInput = { url: string; is_primary: boolean };

export type CarSaveResult = ActionResult<'invalid-input' | 'unavailable'>;
export type CarRemovalResult = ActionResult<'invalid-input' | 'unavailable'>;
export type CarDuplicationResult = ActionResult<'invalid-input' | 'not-found' | 'unavailable'>;

export interface PaginatedCars {
    data: Car[];
    totalCount: number;
    page: number;
    totalPages: number;
}

export interface CarCatalogFilters {
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    page?: number;
    limit?: number;
    /** true for public pages, false for admin */
    availableOnly?: boolean;
}
