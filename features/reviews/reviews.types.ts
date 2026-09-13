import type { z } from 'zod';
import type { ReviewSchema } from './reviews.schema';

export type Review = z.infer<typeof ReviewSchema>;

export interface PaginatedReviews {
    data: Review[];
    totalCount: number;
    page: number;
    totalPages: number;
}
