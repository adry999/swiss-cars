import { describe, it, expect } from 'vitest';
import { CarSchema, ReviewSchema, PartnerSchema } from './index';

describe('CarSchema', () => {
    it('should validate a valid car', () => {
        const validCar = {
            slug: 'audi-a6-2023',
            brand: 'Audi',
            model: 'A6',
            year: 2023,
            price: 45000,
            mileage: 15000,
            fuel_type: 'diesel',
            transmission: 'automatic',
            is_available: true,
            is_featured: false,
        };

        const result = CarSchema.safeParse(validCar);
        expect(result.success).toBe(true);
    });

    it('should reject a car without required fields', () => {
        const invalidCar = {
            brand: 'Audi',
            // missing slug, model, year, price
        };

        const result = CarSchema.safeParse(invalidCar);
        expect(result.success).toBe(false);
    });

    it('should handle string numbers for year and price', () => {
        const carWithStringNumbers = {
            slug: 'test-car',
            brand: 'BMW',
            model: 'X5',
            year: '2022',
            price: '55000',
            is_available: true,
        };

        const result = CarSchema.safeParse(carWithStringNumbers);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.year).toBe(2022);
            expect(result.data.price).toBe(55000);
        }
    });

    it('should reject invalid fuel types', () => {
        const carWithInvalidFuel = {
            slug: 'test-car',
            brand: 'Mercedes',
            model: 'C-Class',
            year: 2023,
            price: 40000,
            fuel_type: 'nuclear', // invalid
        };

        const result = CarSchema.safeParse(carWithInvalidFuel);
        expect(result.success).toBe(false);
    });

    it('should accept valid fuel types', () => {
        const fuelTypes = ['diesel', 'petrol', 'hybrid', 'electric', 'lpg'];

        fuelTypes.forEach((fuel) => {
            const car = {
                slug: 'test-car',
                brand: 'Test',
                model: 'Car',
                year: 2023,
                price: 30000,
                fuel_type: fuel,
            };

            const result = CarSchema.safeParse(car);
            expect(result.success).toBe(true);
        });
    });

    it('should reject negative prices', () => {
        const carWithNegativePrice = {
            slug: 'test-car',
            brand: 'Test',
            model: 'Car',
            year: 2023,
            price: -1000,
        };

        const result = CarSchema.safeParse(carWithNegativePrice);
        expect(result.success).toBe(false);
    });

    it('should reject years before 1900', () => {
        const carWithOldYear = {
            slug: 'test-car',
            brand: 'Test',
            model: 'Car',
            year: 1899,
            price: 10000,
        };

        const result = CarSchema.safeParse(carWithOldYear);
        expect(result.success).toBe(false);
    });
});

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
