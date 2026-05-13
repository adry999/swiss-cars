'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import CarCard from '../CarCard';
import { type Car } from '@/lib/types';
import styles from './CarList.module.css';

type Props = {
    cars: Car[];
};

export default function CarList({ cars }: Props) {
    const t = useTranslations('cars');

    if (cars.length === 0) {
        return (
            <div className={styles.empty}>
                <h3>{t('no_results_title')}</h3>
                <p>{t('no_results_text')}</p>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            <AnimatePresence mode="popLayout">
                {cars.map((car) => (
                    <motion.div
                        key={car.id || car.slug}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CarCard car={car} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
