import { getCarsPaginated } from '@/lib/supabase/queries';
import CarsGridPaginated from '@/components/cars/CarsGridPaginated';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import styles from './page.module.css';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;

    const titles: Record<string, string> = {
        ro: 'Mașini în Stoc | SwissCars',
        ru: 'Автомобили в Наличии | SwissCars',
        en: 'Cars in Stock | SwissCars',
    };

    return {
        title: titles[locale] || titles.ro,
        description: 'Vezi toate mașinile disponibile la SwissCars.',
    };
}

export default async function InventoryPage({ searchParams }: Props) {
    const t = await getTranslations('offers');
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page || '1', 10);

    const { data: cars, totalPages, totalCount } = await getCarsPaginated({
        page,
        limit: 15, // Slightly more per page
    });

    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className="ui-title">{t('all_cars_title') || 'Inventory'}</h1>
                    <p className={styles.count}>
                        {t('cars_available', { count: totalCount })}
                    </p>
                </div>

                <div className={styles.content}>
                    <CarsGridPaginated
                        cars={cars}
                        currentPage={page}
                        totalPages={totalPages}
                    />
                </div>
            </div>
        </main>
    );
}
