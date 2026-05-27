'use client';

import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { Car } from '@/lib/types';
import styles from '../CarEditForm.module.css';

interface GeneralInfoTabProps {
    register: UseFormRegister<Car>;
    errors: FieldErrors<Car>;
    descLang: 'ro' | 'ru' | 'en';
    onDescLangChange: (lang: 'ro' | 'ru' | 'en') => void;
}

export default function GeneralInfoTab({ register, errors, descLang, onDescLangChange }: GeneralInfoTabProps) {
    return (
        <div className={styles.grid}>
            <div className={styles.field}>
                <label>Brand</label>
                <input {...register('brand')} placeholder="e.g. Audi" />
                {errors.brand && <span className={styles.error}>{errors.brand.message}</span>}
            </div>
            <div className={styles.field}>
                <label>Model</label>
                <input {...register('model')} placeholder="e.g. A6 Allroad" />
                {errors.model && <span className={styles.error}>{errors.model.message}</span>}
            </div>
            <div className={styles.field}>
                <label>URL Slug</label>
                <input {...register('slug')} placeholder="unique-car-slug" />
                {errors.slug && <span className={styles.error}>{errors.slug.message}</span>}
            </div>
            <div className={styles.field}>
                <label>Price (€)</label>
                <input type="number" {...register('price', { valueAsNumber: true })} />
                {errors.price && <span className={styles.error}>{errors.price.message}</span>}
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <div className={styles.descTabs}>
                    {(['ro', 'ru', 'en'] as const).map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            className={`${styles.descTabBtn} ${descLang === lang ? styles.descTabActive : ''}`}
                            onClick={() => onDescLangChange(lang)}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>
                {descLang === 'ro' && (
                    <textarea
                        {...register('description.ro' as any)}
                        placeholder="Descriere detaliată (RO)..."
                        rows={8}
                    />
                )}
                {descLang === 'ru' && (
                    <textarea
                        {...register('description.ru' as any)}
                        placeholder="Подробное описание (RU)..."
                        rows={8}
                    />
                )}
                {descLang === 'en' && (
                    <textarea
                        {...register('description.en' as any)}
                        placeholder="Detailed description (EN)..."
                        rows={8}
                    />
                )}
            </div>
            <div className={styles.field}>
                <div className={styles.checkbox}>
                    <input type="checkbox" {...register('is_available')} id="is_available" />
                    <label htmlFor="is_available">Available for sale</label>
                </div>
            </div>
            <div className={styles.field}>
                <div className={styles.checkbox}>
                    <input type="checkbox" {...register('is_featured')} id="is_featured" />
                    <label htmlFor="is_featured">Featured on homepage</label>
                </div>
            </div>
        </div>
    );
}
