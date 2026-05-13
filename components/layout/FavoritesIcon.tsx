'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getFavorites } from '@/components/cars/FavoriteButton';
import styles from './FavoritesIcon.module.css';

export default function FavoritesIcon() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const update = () => setCount(getFavorites().length);
        update();
        window.addEventListener('favorites-changed', update);
        return () => window.removeEventListener('favorites-changed', update);
    }, []);

    return (
        <Link href="/favorites" className={styles.btn} title="Mașini Favorite">
            <Heart size={20} fill={count > 0 ? 'currentColor' : 'none'} />
            {count > 0 && <span className={styles.badge}>{count}</span>}
        </Link>
    );
}
