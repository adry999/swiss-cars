'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { Review } from '@/lib/types';
import styles from './ReviewsSlider.module.css';

type Props = { reviews: Review[]; locale: string };

export default function ReviewsSlider({ reviews, locale }: Props) {
    const t = useTranslations('reviews');
    const [current, setCurrent] = useState(0);

    if (reviews.length === 0) return null;

    const visible = Math.min(3, reviews.length);
    const windowStart = Math.max(0, Math.min(current, reviews.length - visible));
    const visibleReviews = reviews.slice(windowStart, windowStart + visible);

    const getContent = (r: Review) => {
        if (locale === 'ru') return r.content_ru || r.content_ro || '';
        if (locale === 'en') return r.content_en || r.content_ro || '';
        return r.content_ro || '';
    };

    return (
        <section className={`section ${styles.section}`}>
            <div className="container">
                <div className="section-header">
                    <p className="ui-subtitle">{t('subtitle')}</p>
                    <h2 className="ui-title">{t('title')}</h2>
                    <div className="ui-decor" />
                </div>
            </div>

            <div className={styles.sliderContainer}>
                <div className={styles.grid}>
                    <AnimatePresence mode="popLayout" initial={false}>
                        {visibleReviews.map((review) => (
                            <motion.div
                                key={review.id}
                                className={styles.card}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className={styles.stars}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <svg key={i} viewBox="0 0 24 24" fill={i < review.rating ? 'var(--color-primary)' : '#ddd'} width="16" height="16">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>
                                <blockquote className={styles.quote}>&ldquo;{getContent(review)}&rdquo;</blockquote>
                                <div className={styles.author}>
                                    {review.avatar_url ? (
                                        <img
                                            src={review.avatar_url}
                                            alt={review.name}
                                            className={styles.avatarImg}
                                        />
                                    ) : (
                                        <div className={styles.avatar}>
                                            {review.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className={styles.name}>{review.name}</p>
                                        <p className={styles.label}>{t('note')}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {reviews.length > 3 && (
                    <div className={styles.controls}>
                        <button
                            onClick={() => setCurrent(Math.max(0, current - 1))}
                            disabled={current === 0}
                            className={styles.arrowBtn}
                        >
                            ←
                        </button>
                        <button
                            onClick={() => setCurrent(Math.min(reviews.length - visible, current + 1))}
                            disabled={current >= reviews.length - visible}
                            className={styles.arrowBtn}
                        >
                            →
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
