// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { pickSimilarCars } from './similar-cars';
import type { Car } from '../inventory.types';

function makeCar(id: string): Car {
    return {
        id,
        slug: id,
        brand: 'Audi',
        model: 'A6',
        year: 2020,
        price: 20000,
        is_featured: false,
        is_available: true,
    };
}

describe('pickSimilarCars', () => {
    it('lists same-brand cars before price-range cars', () => {
        const sameBrandCars = [makeCar('brand-1'), makeCar('brand-2')];
        const similarPriceCars = [makeCar('price-1')];

        const result = pickSimilarCars({ currentCarId: 'current', limit: 3, sameBrandCars, similarPriceCars });

        expect(result.map((car) => car.id)).toEqual(['brand-1', 'brand-2', 'price-1']);
    });

    it('fills the remaining slots with price-range cars once same-brand cars run out', () => {
        const sameBrandCars = [makeCar('brand-1')];
        const similarPriceCars = [makeCar('price-1'), makeCar('price-2')];

        const result = pickSimilarCars({ currentCarId: 'current', limit: 2, sameBrandCars, similarPriceCars });

        expect(result.map((car) => car.id)).toEqual(['brand-1', 'price-1']);
    });

    it('keeps a car that appears in both lists only once', () => {
        const shared = makeCar('shared');
        const sameBrandCars = [shared];
        const similarPriceCars = [shared, makeCar('price-1')];

        const result = pickSimilarCars({ currentCarId: 'current', limit: 3, sameBrandCars, similarPriceCars });

        expect(result.map((car) => car.id)).toEqual(['shared', 'price-1']);
    });

    it('never includes the current car', () => {
        const currentCar = makeCar('current');
        const sameBrandCars = [currentCar, makeCar('brand-1')];

        const result = pickSimilarCars({ currentCarId: 'current', limit: 3, sameBrandCars, similarPriceCars: [] });

        expect(result.map((car) => car.id)).toEqual(['brand-1']);
    });

    it('never exceeds the limit', () => {
        const sameBrandCars = [makeCar('brand-1'), makeCar('brand-2'), makeCar('brand-3')];
        const similarPriceCars = [makeCar('price-1'), makeCar('price-2')];

        const result = pickSimilarCars({ currentCarId: 'current', limit: 3, sameBrandCars, similarPriceCars });

        expect(result).toHaveLength(3);
    });
});
