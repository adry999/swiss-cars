'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import styles from './CarGallery.module.css';

type Props = {
    images: { url: string; is_primary: boolean }[];
};

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function CarGallery({ images }: Props) {
    const [index, setIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const expandBtnRef = useRef<HTMLButtonElement>(null);
    const lightboxRef = useRef<HTMLDivElement>(null);
    // Distinguishes "just closed" from "never opened" — without this, the
    // focus-restore effect below also ran on first mount and stole focus
    // into the expand button the instant every car detail page loaded.
    const wasOpen = useRef(false);
    const hasMultiple = images.length > 1;

    const next = useCallback(() => setIndex((prev) => (prev + 1) % images.length), [images.length]);
    const prev = useCallback(() => setIndex((prev) => (prev - 1 + images.length) % images.length), [images.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                setIsOpen(false);
                return;
            }
            if (e.key === 'ArrowRight' && hasMultiple) next();
            if (e.key === 'ArrowLeft' && hasMultiple) prev();
            if (e.key !== 'Tab' || !lightboxRef.current) return;

            const focusable = lightboxRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, next, prev, hasMultiple]);

    // Move focus into the lightbox on open, restore it to the trigger on
    // close — but only across an actual open->close transition, not on
    // mount (isOpen starts false, so a naive [isOpen]-only effect fires the
    // "restore" branch immediately when the gallery first renders).
    useEffect(() => {
        if (isOpen) {
            closeBtnRef.current?.focus();
            wasOpen.current = true;
        } else if (wasOpen.current) {
            expandBtnRef.current?.focus();
            wasOpen.current = false;
        }
    }, [isOpen]);

    if (!images || images.length === 0) return (
        <div className={styles.placeholder}>No images available</div>
    );

    const caption = `Photo ${index + 1} of ${images.length}`;

    return (
        <div className={styles.wrapper}>
            <div className={styles.mainImageWrapper}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={styles.mainImage}
                    >
                        <Image
                            src={images[index].url}
                            alt={caption}
                            fill
                            className={styles.image}
                            sizes="(max-width: 1024px) 100vw, 800px"
                            quality={85}
                            priority
                            style={{ cursor: 'pointer' }}
                            onClick={() => setIsOpen(true)}
                        />
                    </motion.div>
                </AnimatePresence>

                <button
                    ref={expandBtnRef}
                    onClick={() => setIsOpen(true)}
                    className={styles.expandBtn}
                    aria-label="View full-screen gallery"
                >
                    <Maximize2 size={24} />
                </button>

                {hasMultiple && (
                    <>
                        <button onClick={prev} className={`${styles.navBtn} ${styles.prev}`} aria-label="Previous image">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={next} className={`${styles.navBtn} ${styles.next}`} aria-label="Next image">
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </div>

            {hasMultiple && (
                <div className={styles.thumbnails}>
                    {images.map((img, i) => (
                        <button
                            key={img.url}
                            className={`${styles.thumb} ${i === index ? styles.activeThumb : ''}`}
                            onClick={() => setIndex(i)}
                            aria-label={`View photo ${i + 1} of ${images.length}`}
                            aria-current={i === index}
                        >
                            <Image
                                src={img.url}
                                alt=""
                                fill
                                className={styles.image}
                                sizes="120px"
                                quality={60}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Portal/Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={lightboxRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Image gallery — ${caption}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={styles.lightboxOverlay}
                        onClick={() => setIsOpen(false)}
                    >
                        <button
                            ref={closeBtnRef}
                            onClick={() => setIsOpen(false)}
                            className={styles.lightboxClose}
                            aria-label="Close full-screen gallery"
                        >
                            <X size={28} />
                        </button>

                        <div className={styles.lightboxContent}>
                            {hasMultiple && (
                                <button onClick={(e) => { e.stopPropagation(); prev(); }} className={`${styles.navBtn} ${styles.prev}`} aria-label="Previous image">
                                    <ChevronLeft size={32} />
                                </button>
                            )}

                            <motion.div
                                className={styles.lightboxImageWrapper}
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Image
                                    src={images[index].url}
                                    alt={caption}
                                    fill
                                    className={styles.lightboxImage}
                                    sizes="100vw"
                                    quality={100}
                                    priority
                                    unoptimized
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </motion.div>

                            {hasMultiple && (
                                <button onClick={(e) => { e.stopPropagation(); next(); }} className={`${styles.navBtn} ${styles.next}`} aria-label="Next image">
                                    <ChevronRight size={32} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
