import { getTranslations } from 'next-intl/server';
import { getSimilarCars } from '@/lib/supabase/queries';
import CarCard from '@/components/cars/CarCard';

type Props = {
    currentCarId: string;
    brand: string;
    price: number;
};

export default async function SimilarCars({ currentCarId, brand, price }: Props) {
    const t = await getTranslations('car_detail');

    // Queried directly rather than loading the whole public inventory and
    // filtering three rows out of it in memory.
    const similar = await getSimilarCars({ currentCarId, brand, price, limit: 3 });

    if (similar.length === 0) return null;

    return (
        <section style={{ padding: '60px 0', background: 'var(--color-gray)' }}>
            <div className="container">
                <div style={{ marginBottom: '40px' }}>
                    <p className="ui-subtitle">{t('similar_cars_subtitle')}</p>
                    <h2 className="ui-title">{t('similar_cars_title')}</h2>
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
