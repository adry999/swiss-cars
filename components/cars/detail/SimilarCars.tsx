import { getCars } from '@/lib/supabase/queries';
import CarCard from '@/components/cars/CarCard';
import type { Car } from '@/lib/types';

type Props = {
    currentCarId: string;
    brand: string;
    price: number;
};

export default async function SimilarCars({ currentCarId, brand, price }: Props) {
    const allCars = await getCars();

    // Find similar: same brand first, then similar price range (±30%)
    const sameBrand = allCars.filter(
        (c) => c.id !== currentCarId &&
            c.brand &&
            brand &&
            c.brand.toLowerCase() === brand.toLowerCase()
    );

    const priceRange = allCars.filter(
        (c) =>
            c.id !== currentCarId &&
            (!c.brand || !brand || c.brand.toLowerCase() !== brand.toLowerCase()) &&
            c.price >= price * 0.7 &&
            c.price <= price * 1.3
    );

    const similar: Car[] = [...sameBrand, ...priceRange].slice(0, 3);

    if (similar.length === 0) return null;

    return (
        <section style={{ padding: '60px 0', background: 'var(--color-gray)' }}>
            <div className="container">
                <div style={{ marginBottom: '40px' }}>
                    <p className="ui-subtitle">Poate te interesează</p>
                    <h2 className="ui-title">Mașini Similare</h2>
                    <div className="ui-decor ui-decor--left" />
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px',
                }}>
                    {similar.map((car) => (
                        <CarCard key={car.id} car={car} />
                    ))}
                </div>
            </div>
        </section>
    );
}
