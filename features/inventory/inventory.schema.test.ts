import { describe, it, expect } from 'vitest';
import { CarSchema } from './inventory.schema';

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
