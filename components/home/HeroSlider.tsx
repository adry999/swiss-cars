'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import type { HeroSlide } from '@/lib/types';
import styles from './HeroSlider.module.css';

interface Props {
    slides?: HeroSlide[];
}

const defaultSlides: HeroSlide[] = [
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
    const prefersReducedMotion = useReducedMotion();
    const [isPaused, setIsPaused] = useState(false);
    const autoplay = !isPaused && !prefersReducedMotion && slides.length > 1;

    const next = useCallback(() => {
        setCurrent((c) => (c + 1) % slides.length);
    }, [slides.length]);

    // WCAG 2.2.2: auto-advancing content needs a way to pause it. Also
    // respects prefers-reduced-motion outright rather than just softening
    // the transition.
    useEffect(() => {
        if (!autoplay) return;
        const interval = setInterval(next, 6000);
        return () => clearInterval(interval);
    }, [next, autoplay]);

    const slide = slides[current];
    if (!slide) return null;

    const getText = (field: Record<string, string | undefined>) => field[locale] || field['ro'] || '';

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

            {/* Dots + pause control */}
            <div className={styles.dots}>
                {slides.map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                        onClick={() => setCurrent(i)}
                        aria-label={`Slide ${i + 1}`}
                        aria-current={i === current}
                    />
                ))}
                {slides.length > 1 && !prefersReducedMotion && (
                    <button
                        className={styles.dot}
                        onClick={() => setIsPaused((p) => !p)}
                        aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
                    >
                        {isPaused ? <Play size={12} /> : <Pause size={12} />}
                    </button>
                )}
            </div>
        </section>
    );
}
