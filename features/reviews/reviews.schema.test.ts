import { describe, it, expect } from 'vitest';
import { ReviewSchema } from './reviews.schema';

describe('ReviewSchema', () => {
    it('should validate a valid review', () => {
        const validReview = {
            name: 'John Doe',
            rating: 5,
            content_ro: 'Recenzie excelentă',
            content_ru: null,
            content_en: 'Excellent review',
            avatar_url: null,
            is_visible: true,
        };

        const result = ReviewSchema.safeParse(validReview);
        expect(result.success).toBe(true);
    });

    it('should reject rating outside 1-5 range', () => {
        const reviewWithInvalidRating = {
            name: 'Test User',
            rating: 6,
            is_visible: true,
        };

        const result = ReviewSchema.safeParse(reviewWithInvalidRating);
        expect(result.success).toBe(false);
    });

    it('should reject rating of 0', () => {
        const reviewWithZeroRating = {
            name: 'Test User',
            rating: 0,
            is_visible: true,
        };

        const result = ReviewSchema.safeParse(reviewWithZeroRating);
        expect(result.success).toBe(false);
    });

    it('should require a name', () => {
        const reviewWithoutName = {
            rating: 4,
            is_visible: true,
        };

        const result = ReviewSchema.safeParse(reviewWithoutName);
        expect(result.success).toBe(false);
    });
});
