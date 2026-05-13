'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import styles from './CarGallery.module.css';

type Props = {
    images: { url: string; is_primary: boolean }[];
};

export default function CarGallery({ images }: Props) {
    const [index, setIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const next = useCallback(() => setIndex((prev) => (prev + 1) % images.length), [images.length]);
    const prev = useCallback(() => setIndex((prev) => (prev - 1 + images.length) % images.length), [images.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') setIsOpen(false);
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
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
    }, [isOpen, next, prev]);

    if (!images || images.length === 0) return (
        <div className={styles.placeholder}>No images available</div>
    );

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
                            alt="Car image"
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

                <button onClick={() => setIsOpen(true)} className={styles.expandBtn} aria-label="Expand image">
                    <Maximize2 size={24} />
                </button>

                <button onClick={prev} className={`${styles.navBtn} ${styles.prev}`} aria-label="Previous image">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={next} className={`${styles.navBtn} ${styles.next}`} aria-label="Next image">
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className={styles.thumbnails}>
                {images.map((img, i) => (
                    <button
                        key={img.url}
                        className={`${styles.thumb} ${i === index ? styles.activeThumb : ''}`}
                        onClick={() => setIndex(i)}
                        aria-label={`View image ${i + 1}`}
                    >
                        <Image
                            src={img.url}
                            alt="Thumbnail"
                            fill
                            className={styles.image}
                            sizes="120px"
                            quality={60}
                        />
                    </button>
                ))}
            </div>

            {/* Lightbox Portal/Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={styles.lightboxOverlay}
                        onClick={() => setIsOpen(false)}
                    >
                        <button onClick={() => setIsOpen(false)} className={styles.lightboxClose} aria-label="Close fullscreen">
                            <X size={28} />
                        </button>

                        <div className={styles.lightboxContent}>
                            <button onClick={(e) => { e.stopPropagation(); prev(); }} className={`${styles.navBtn} ${styles.prev}`} aria-label="Previous image">
                                <ChevronLeft size={32} />
                            </button>

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
                                    alt="Car image expanded"
                                    fill
                                    className={styles.lightboxImage}
                                    sizes="100vw"
                                    quality={100}
                                    priority
                                    unoptimized
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </motion.div>

                            <button onClick={(e) => { e.stopPropagation(); next(); }} className={`${styles.navBtn} ${styles.next}`} aria-label="Next image">
                                <ChevronRight size={32} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
