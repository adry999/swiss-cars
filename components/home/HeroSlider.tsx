'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HeroSlider.module.css';

interface Slide {
    imageSrc: string;
    slogan: Record<string, string>;
    title: Record<string, string>;
    cta: Record<string, string>;
    ctaHref: string;
}

interface Props {
    slides?: Slide[];
}

const defaultSlides: Slide[] = [
    {
        imageSrc: '/media/content/b-main-slider/slider.png',
        slogan: { ro: 'EȘTI GATA SĂ', ru: 'Готов к', en: 'Are you ready to' },
        title: { ro: 'CUMPERI O MAȘINĂ?', ru: 'Покупке авто?', en: 'Buy a car?' },
        cta: { ro: 'VEZI OFERTE', ru: 'Смотреть предложения', en: 'View offers' },
        ctaHref: '#offers'
    },
    {
        imageSrc: '/media/content/b-main-slider/bg.png',
        slogan: { ro: 'O NOUĂ VIZIUNE ASUPRA', ru: 'Новый взгляд на', en: 'A new vision on' },
        title: { ro: 'PIEȚEI AUTO!', ru: 'Автомобильный рынок!', en: 'The car market!' },
        cta: { ro: 'DESCOPERĂ', ru: 'Обнаружить', en: 'Discover' },
        ctaHref: '#offers'
    }
];

export default function HeroSlider({ slides: propSlides }: Props) {
    const locale = useLocale();
    const slides = propSlides && propSlides.length > 0 ? propSlides : defaultSlides;

    const [current, setCurrent] = useState(0);

    const next = useCallback(() => {
        setCurrent((c) => (c + 1) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        const interval = setInterval(next, 6000);
        return () => clearInterval(interval);
    }, [next]);

    const slide = slides[current];
    if (!slide) return null;

    const getText = (field: Record<string, string>) => field[locale] || field['ro'] || '';

    return (
        <section className={styles.hero} id="main-slider">
            {/* Background Images */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.imageSrc}
                    className={styles.bg}
                    initial={{ opacity: 0, scale: 1.15 }}
                    animate={{ opacity: 1, scale: 1.05 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ backgroundImage: `url(${slide.imageSrc})` }}
                />
            </AnimatePresence>

            {/* Dark overlay */}
            <div className={styles.overlay} />

            {/* Content */}
            <div className={`container ${styles.content}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className={styles.textBlock}
                    >
                        <motion.p
                            className={styles.slogan}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                        >
                            {getText(slide.slogan)}
                        </motion.p>
                        <motion.h1
                            className={styles.title}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {getText(slide.title)}
                        </motion.h1>
                        <motion.a
                            href={slide.ctaHref}
                            className={styles.cta}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            whileHover={{ scale: 1.04 }}
                        >
                            {getText(slide.cta)}
                        </motion.a>
                    </motion.div>
                </AnimatePresence>

                {/* Scroll indicator */}
                <motion.div
                    className={styles.scrollIndicator}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <div className={styles.scrollLine} />
                </motion.div>
            </div>

            {/* Dots */}
            <div className={styles.dots}>
                {slides.map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                        onClick={() => setCurrent(i)}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
