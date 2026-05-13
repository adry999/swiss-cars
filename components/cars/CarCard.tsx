'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { Car } from '@/lib/types';
import FavoriteButton from './FavoriteButton';
import { formatPrice } from '@/lib/utils/format';
import styles from './CarCard.module.css';

type Props = { car: Car };

export default function CarCard({ car }: Props) {
    const t = useTranslations('offers');
    const locale = useLocale();

    const primaryImage = car.car_images?.find((img: any) => img.is_primary) || car.car_images?.[0];
    const imageUrl = primaryImage?.url || '/media/content/b-goods/placeholder.jpg';

    return (
        <article className={styles.card}>
            <div className={styles.imageWrap}>
                <Link href={`/inventory/${car.slug}`}>
                    <Image
                        src={imageUrl}
                        alt={`${car.brand} ${car.model} ${car.year}`}
                        fill
                        className={styles.image}
                        sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={75}
                    />
                </Link>
                <div className={`${styles.priceTag} ${!car.is_available ? styles.soldTag : ''}`}>
                    {car.is_available ? `${formatPrice(car.price)} €` : t('sold')}
                </div>
                <div className={styles.favBtn}>
                    <FavoriteButton carId={car.id ?? ''} carSlug={car.slug} carName={`${car.brand} ${car.model}`} />
                </div>
            </div>

            <div className={styles.body}>
                <div className={styles.header}>
                    <h3 className={styles.name}>
                        {car.brand} {car.model}
                    </h3>
                    <span className={styles.year}>{car.year}</span>
                </div>

                {car.mileage && (
                    <div className={styles.mileage}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        {car.mileage.toLocaleString()} {t('km')}
                    </div>
                )}

                <ul className={styles.specs}>
                    {car.fuel_type && <li>{car.fuel_type}</li>}
                    {car.transmission && <li>{car.transmission}</li>}
                    {car.engine_cc && <li>{(car.engine_cc / 1000).toFixed(1)} L</li>}
                </ul>

                <Link href={`/inventory/${car.slug}`} className={styles.link}>
                    {t('view_details')}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </article>
    );
}
