import type { z } from 'zod';
import type { CarSchema } from './inventory.schema';

export type Car = z.infer<typeof CarSchema>;

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
