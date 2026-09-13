'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import styles from './ServicesSection.module.css';

const SERVICES = [
    { key: 'service1', icon: '🔍' },
    { key: 'service2', icon: '🔧' },
    { key: 'service3', icon: '🚚' },
    { key: 'service4', icon: '🏷️' },
    { key: 'service5', icon: '⚙️' },
    { key: 'service6', icon: '🛡️' },
];

export default function ServicesSectionClient({
    title,
    imageSrc,
    services
}: {
    title: string;
    imageSrc: string;
    services: { icon: string; name: string; short: string; full: string }[];
}) {
    const [active, setActive] = useState(0);

    return (
        <section className={`${styles.section} section--dark`} id="services">
            <div className={styles.container}>
                {/* Left image panel */}
                <div className={styles.imagePanel}>
                    <Image
                        src={imageSrc}
                        alt="Services"
                        fill
                        className={styles.image}
                    />
                    <div className={styles.imageOverlay} />
                </div>

                {/* Right: tabs + content */}
                <div className={styles.contentPanel}>
                    <div className={styles.header}>
                        <h2 className="ui-title">{title}</h2>
                        <div className="ui-decor ui-decor--left" />
                    </div>

                    <div className={styles.content}>
                        <p className={styles.activeText}>
                            {services[active].full}
                        </p>
                    </div>

                    <div className={styles.tabs}>
                        {services.map((s, i) => (
                            <button
                                key={i}
                                className={`${styles.tab} ${i === active ? styles.tabActive : ''}`}
                                onClick={() => setActive(i)}
                            >
                                <span className={styles.tabIcon}>{s.icon}</span>
                                <div className={styles.tabText}>
                                    <strong>{s.name}</strong>
                                    <span>{s.short}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
