'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@shared/ui/Toast/ToastContext';
import { readFavoriteCarIds, writeFavoriteCarIds } from '../model/favorite-car-ids';
import styles from './FavoriteButton.module.css';

type Props = {
    carId: string;
    carSlug: string;
    carName: string;
};

export default function FavoriteButton({ carId, carSlug, carName }: Props) {
    const [isFav, setIsFav] = useState(false);
    const t = useTranslations('favorites');
    const toast = useToast();

    useEffect(() => {
        setIsFav(readFavoriteCarIds().includes(carId));
    }, [carId]);

    const toggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const favs = readFavoriteCarIds();
        const wasAdded = !favs.includes(carId);
        const next = wasAdded ? [...favs, carId] : favs.filter((id) => id !== carId);

        writeFavoriteCarIds(next);
        setIsFav(next.includes(carId));

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
