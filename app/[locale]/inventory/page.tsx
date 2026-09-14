import { readCatalogPage } from '@features/inventory/server';
import { localizedPageMetadata } from '@i18n/routing';
import { InventoryGrid } from '@features/inventory';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import styles from './page.module.css';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return localizedPageMetadata({
        locale,
        path: '/inventory',
        copyByLocale: {
            ro: { title: 'Mașini în Stoc', description: 'Vezi toate mașinile disponibile la SwissCars.' },
            ru: { title: 'Автомобили в Наличии', description: 'Все автомобили, доступные в наличии у SwissCars.' },
            en: { title: 'Cars in Stock', description: 'Browse every car currently available at SwissCars.' },
        },
    });
}

export default async function InventoryPage({ searchParams }: Props) {
    const t = await getTranslations('offers');
    const resolvedParams = await searchParams;
    // Guard against ?page=abc / negative values reaching .range(NaN, NaN).
    const page = Math.max(1, Number.parseInt(resolvedParams.page ?? '1', 10) || 1);

    const { data: cars, totalPages, totalCount } = await readCatalogPage({
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
                    <InventoryGrid
                        cars={cars}
                        currentPage={page}
                        totalPages={totalPages}
                    />
                </div>
            </div>
        </main>
    );
}
