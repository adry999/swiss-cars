'use client';

import { useEffect, useState } from 'react';
import styles from './Preloader.module.css';

export default function Preloader() {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setHidden(true), 600);
        return () => clearTimeout(timer);
    }, []);

    if (hidden) return null;

    return (
        <div className={styles.preloader}>
            <div className={styles.logo}>
                <div className={styles.spinner} />
            </div>
        </div>
    );
}
