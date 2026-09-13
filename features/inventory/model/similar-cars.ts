import type { Car } from '../inventory.types';

interface PickSimilarCarsOptions {
    currentCarId: string;
    limit: number;
    sameBrandCars: Car[];
    similarPriceCars: Car[];
}

/** Same-brand cars first, then price-range cars fill the rest; the current car and duplicates never appear. */
export function pickSimilarCars({ currentCarId, limit, sameBrandCars, similarPriceCars }: PickSimilarCarsOptions): Car[] {
    const picked: Car[] = [];
    const seen = new Set<string>([currentCarId]);

    const take = (cars: Car[]) => {
        for (const car of cars) {
            if (picked.length >= limit) return;
            const id = car.id ?? '';
            if (seen.has(id)) continue;
            seen.add(id);
            picked.push(car);
        }
    };

    take(sameBrandCars);
    take(similarPriceCars);

    return picked;
}
