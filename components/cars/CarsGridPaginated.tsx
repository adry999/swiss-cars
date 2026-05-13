'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CarCard from '@/components/cars/CarCard';
import Pagination from '@/components/ui/Pagination';
import type { Car } from '@/lib/types';
import styles from '@/components/home/CarsGrid.module.css';

type Props = {
    cars: Car[];
    currentPage: number;
    totalPages: number;
};

export default function CarsGridPaginated({ cars, currentPage, totalPages }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className={styles.wrapper}>
            <motion.div layout className={styles.grid}>
                <AnimatePresence mode="popLayout">
                    {cars.length === 0 ? (
                        <motion.p
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={styles.empty}
                        >
                            No cars found
                        </motion.p>
                    ) : (
                        cars.map((car) => (
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

            {totalPages > 1 && (
                <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}
