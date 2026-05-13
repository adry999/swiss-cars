'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/ui/Toast';
import styles from './FavoriteButton.module.css';

type Props = {
    carId: string;
    carSlug: string;
    carName: string;
};

const STORAGE_KEY = 'swisscars_favorites';

export function getFavorites(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export default function FavoriteButton({ carId, carSlug, carName }: Props) {
    const [isFav, setIsFav] = useState(false);
    const t = useTranslations('favorites');
    const toast = useToast();

    useEffect(() => {
        setIsFav(getFavorites().includes(carId));
    }, [carId]);

    const toggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const favs = getFavorites();
        let next: string[];
        const wasAdded = !favs.includes(carId);

        if (favs.includes(carId)) {
            next = favs.filter((id) => id !== carId);
        } else {
            next = [...favs, carId];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setIsFav(next.includes(carId));
        // Dispatch event so other components can react
        window.dispatchEvent(new Event('favorites-changed'));

        // Show toast notification
        if (wasAdded) {
            toast.success(t('added', { name: carName }));
        } else {
            toast.info(t('removed', { name: carName }));
        }
    };

    return (
        <button
            onClick={toggle}
            className={`${styles.btn} ${isFav ? styles.active : ''}`}
            aria-label={isFav ? t('remove') : t('add')}
            title={isFav ? t('remove') : t('add')}
        >
            <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
        </button>
    );
}
