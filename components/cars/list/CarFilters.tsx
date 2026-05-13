'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Search, ChevronDown, X } from 'lucide-react';
import styles from './CarFilters.module.css';

const BRANDS = ['Audi', 'Mercedes', 'Volvo', 'Fiat', 'Volkswagen', 'BMW'];

export default function CarFilters() {
    const t = useTranslations('cars.filters');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateFilters = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const currentBrand = searchParams.get('brand') || 'all';

    return (
        <div className={styles.wrapper}>
            <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    className={styles.input}
                    onChange={(e) => updateFilters('q', e.target.value)}
                />
            </div>

            <div className={styles.filterGroup}>
                <label className={styles.label}>{t('brand')}</label>
                <div className={styles.selectWrapper}>
                    <select
                        className={styles.select}
                        value={currentBrand}
                        onChange={(e) => updateFilters('brand', e.target.value)}
                    >
                        <option value="all">{t('all_brands')}</option>
                        {BRANDS.map(brand => (
                            <option key={brand} value={brand.toLowerCase()}>{brand}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className={styles.chevron} />
                </div>
            </div>

            <div className={styles.priceGroup}>
                <label className={styles.label}>{t('price_range')}</label>
                <div className={styles.rangeInputs}>
                    <input
                        type="number"
                        placeholder="Min"
                        className={styles.inputSmall}
                        defaultValue={searchParams.get('minPrice') || ''}
                        onBlur={(e) => updateFilters('minPrice', e.target.value)}
                    />
                    <span className={styles.divider}>-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        className={styles.inputSmall}
                        defaultValue={searchParams.get('maxPrice') || ''}
                        onBlur={(e) => updateFilters('maxPrice', e.target.value)}
                    />
                </div>
            </div>

            <button
                className={styles.resetBtn}
                onClick={() => router.replace(pathname)}
            >
                <X size={14} /> {t('reset')}
            </button>
        </div>
    );
}
