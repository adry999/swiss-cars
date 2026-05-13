'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { X } from 'lucide-react';
import styles from './ActiveFilters.module.css';

export default function ActiveFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters = Array.from(searchParams.entries()).filter(([key]) => key !== 'page');

    if (filters.length === 0) return null;

    const removeFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        // Special handling if there are multiple values for the same key (not used yet but good practice)
        const values = params.getAll(key).filter(v => v !== value);
        params.delete(key);
        values.forEach(v => params.append(key, v));

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className={styles.wrapper}>
            {filters.map(([key, value]) => (
                <button
                    key={`${key}-${value}`}
                    className={styles.chip}
                    onClick={() => removeFilter(key, value)}
                >
                    <span className={styles.key}>{key}:</span> {value}
                    <X size={12} className={styles.icon} />
                </button>
            ))}
            <button
                className={styles.clearAll}
                onClick={() => router.replace(pathname)}
            >
                Clear all
            </button>
        </div>
    );
}
