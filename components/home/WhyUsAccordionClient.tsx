'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './WhyUsAccordion.module.css';

const ITEMS = ['q1', 'q2', 'q3', 'q4'] as const;

export default function WhyUsAccordionClient({
    title,
    items
}: {
    title: string;
    items: { title: string; text: string }[];
}) {
    const [open, setOpen] = useState<number>(0);

    return (
        <section className={`section ${styles.section}`}>
            <div className="container">
                <div className={styles.grid}>
                    <div>
                        <p className="ui-subtitle" style={{ color: 'var(--color-primary)' }}>SwissCars</p>
                        <h2 className="ui-title">{title}</h2>
                        <div className="ui-decor ui-decor--left" />

                        <div className={styles.accordion}>
                            {items.map((item, i) => (
                                <div key={i} className={styles.item}>
                                    <button
                                        className={`${styles.trigger} ${open === i ? styles.triggerOpen : ''}`}
                                        onClick={() => setOpen(open === i ? -1 : i)}
                                    >
                                        <span className={styles.num}>0{i + 1}</span>
                                        <span className={styles.triggerTitle}>{item.title}</span>
                                        <svg
                                            className={`${styles.icon} ${open === i ? styles.iconOpen : ''}`}
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"
                                        >
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </button>
                                    <AnimatePresence>
                                        {open === i && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className={styles.body}
                                            >
                                                <p>{item.text}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.visual}>
                        <div className={styles.badge}>
                            <span className={styles.badgeNum}>10+</span>
                            <span className={styles.badgeLabel}>ani de experiență</span>
                        </div>
                        <div className={styles.badgeSmall}>
                            <span>🇨🇭</span>
                            <span>Elveția</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
