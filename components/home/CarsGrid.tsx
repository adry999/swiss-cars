'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import CarCard from '@/components/cars/CarCard';
import type { Car } from '@/lib/types';
import styles from './CarsGrid.module.css';

const BRANDS = ['all', 'audi', 'mercedes', 'volvo', 'bmw', 'volkswagen'];

type Props = {
    cars: Car[];
    showViewAll?: boolean;
    hideHeader?: boolean;
};

export default function CarsGrid({ cars, showViewAll = true, hideHeader = false }: Props) {
    const t = useTranslations('offers');
    const [activeFilter, setActiveFilter] = useState('all');

    const filtered = activeFilter === 'all'
        ? cars
        : cars.filter((c) => c.brand.toLowerCase() === activeFilter);

    const filterLabels: Record<string, string> = {
        all: t('filter_all'),
        audi: t('filter_audi'),
        mercedes: t('filter_mercedes'),
        volvo: t('filter_volvo'),
        bmw: t('filter_bmw'),
        volkswagen: t('filter_volkswagen'),
    };

    // Only show filters for brands that actually have cars
    const availableBrands = BRANDS.filter(
        (b) => b === 'all' || cars.some((c) => c.brand.toLowerCase() === b)
    );

    return (
        <section className={`section section--gray ${styles.section}`} id="offers">
            <div className="container">
                {/* Conditional Header */}
                {!hideHeader && (
                    <div className="section-header">
                        <p className="ui-subtitle">{t('subtitle')}</p>
                        <h2 className="ui-title">{t('title')}</h2>
                        <div className="ui-decor" />
                    </div>
                )}

                {/* Filter Tabs */}
                {availableBrands.length > 1 && (
                    <div className={styles.filters}>
                        {availableBrands.map((brand) => (
                            <button
                                key={brand}
                                className={`${styles.filterBtn} ${activeFilter === brand ? styles.filterActive : ''}`}
                                onClick={() => setActiveFilter(brand)}
                            >
                                {filterLabels[brand] || brand}
                            </button>
                        ))}
                    </div>
                )}

                {/* Cars Grid */}
                <motion.div layout className={styles.grid}>
                    <AnimatePresence mode="popLayout">
                        {filtered.length === 0 ? (
                            <motion.p
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={styles.empty}
                            >
                                {t('no_cars')}
                            </motion.p>
                        ) : (
                            filtered.map((car) => (
                                <motion.div
                                    key={car.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CarCard car={car} />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* View All Button */}
                {showViewAll && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                        <Link href="/inventory" className="btn btn-primary">
                            {t('view_all_inventory') || 'View All Inventory'}
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
