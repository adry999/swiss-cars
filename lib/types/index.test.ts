import { describe, it, expect } from 'vitest';
import { ReviewSchema, PartnerSchema } from './index';

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

describe('PartnerSchema', () => {
    it('should validate a valid partner', () => {
        const validPartner = {
            name: 'Partner Company',
            logo_url: 'https://example.com/logo.png',
            website_url: 'https://example.com',
            sort_order: 1,
            is_visible: true,
        };

        const result = PartnerSchema.safeParse(validPartner);
        expect(result.success).toBe(true);
    });

    it('should allow null values for optional fields', () => {
        const partnerWithNulls = {
            name: null,
            logo_url: null,
            website_url: null,
            is_visible: true,
        };

        const result = PartnerSchema.safeParse(partnerWithNulls);
        expect(result.success).toBe(true);
    });

    it('should default is_visible to true', () => {
        const partner = {
            name: 'Test Partner',
            logo_url: null,
            website_url: null,
            sort_order: 1,
        };

        const result = PartnerSchema.safeParse(partner);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.is_visible).toBe(true);
        }
    });
});
