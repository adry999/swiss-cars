'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@shared/session/require-admin';
import { ReviewSchema } from './reviews.schema';
import type { ReviewRemovalResult, ReviewSaveResult } from './reviews.types';
import { deleteReviewRecord, saveReviewRecord } from './server/reviews-repository';

const ReviewIdSchema = z.uuid();

function revalidateReviews() {
    revalidatePath('/', 'layout');
    revalidatePath('/admin/reviews');
}

export async function saveReview(reviewData: unknown): Promise<ReviewSaveResult> {
    await requireAdmin();

    const parsed = ReviewSchema.safeParse(reviewData);
    if (!parsed.success) {
        return {
            status: 'rejected',
            reason: 'invalid-input',
            invalidFields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? 'review')))],
        };
    }

    const { created_at, ...review } = parsed.data;

    try {
        await saveReviewRecord(review);
    } catch (error) {
        console.error('Save review failed:', error);
        return { status: 'rejected', reason: 'unavailable' };
    }

    revalidateReviews();
    return { status: 'succeeded' };
}

export async function deleteReview(reviewId: string): Promise<ReviewRemovalResult> {
    await requireAdmin();
    if (!ReviewIdSchema.safeParse(reviewId).success) {
        return { status: 'rejected', reason: 'invalid-input' };
    }

    try {
        await deleteReviewRecord(reviewId);
    } catch (error) {
        console.error('Delete review failed:', error);
        return { status: 'rejected', reason: 'unavailable' };
    }

    revalidateReviews();
    return { status: 'succeeded' };
}
