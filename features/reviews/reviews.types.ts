import type { z } from 'zod';
import type { ActionResult } from '@shared/contracts/action-result';
import type { ReviewSchema } from './reviews.schema';

export type Review = z.infer<typeof ReviewSchema>;

/** A review row without the field the repository never writes (created_at). */
export type ReviewRecord = Omit<Review, 'created_at'>;

export type ReviewSaveResult = ActionResult<'invalid-input' | 'unavailable'>;
export type ReviewRemovalResult = ActionResult<'invalid-input' | 'unavailable'>;

export interface PaginatedReviews {
    data: Review[];
    totalCount: number;
    page: number;
    totalPages: number;
}
