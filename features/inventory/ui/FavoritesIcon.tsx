'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { readFavoriteCarIds, FAVORITES_CHANGED_EVENT } from '../model/favorite-car-ids';
import styles from './FavoritesIcon.module.css';

export default function FavoritesIcon() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const update = () => setCount(readFavoriteCarIds().length);
        update();
        window.addEventListener(FAVORITES_CHANGED_EVENT, update);
        return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, update);
    }, []);

    return (
        <Link href="/favorites" className={styles.btn} title="Mașini Favorite">
            <Heart size={20} fill={count > 0 ? 'currentColor' : 'none'} />
            {count > 0 && <span className={styles.badge}>{count}</span>}
        </Link>
    );
}
