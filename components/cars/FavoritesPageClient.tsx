'use client';

import { useState, useEffect } from 'react';
import { Heart, X } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { getFavorites } from '@/components/cars/FavoriteButton';
import { getCars } from '@/lib/supabase/queries';
import { formatPrice } from '@/lib/utils/format';
import type { Car } from '@/lib/types';

// This page fetches from localStorage on client, then loads cars client-side
// We use a different approach: call an API route

export default function FavoritesPageClient({ allCars }: { allCars: Car[] }) {
    const t = useTranslations('favorites');
    const [favIds, setFavIds] = useState<string[]>([]);

    useEffect(() => {
        const load = () => setFavIds(getFavorites());
        load();
        window.addEventListener('favorites-changed', load);
        return () => window.removeEventListener('favorites-changed', load);
    }, []);

    const favCars = allCars.filter(c => favIds.includes(c.id ?? ''));

    const remove = (id: string) => {
        const next = favIds.filter(f => f !== id);
        localStorage.setItem('swisscars_favorites', JSON.stringify(next));
        setFavIds(next);
        window.dispatchEvent(new Event('favorites-changed'));
    };

    return (
        <main style={{ paddingTop: '66px', paddingBottom: '80px', minHeight: '80vh', background: 'var(--color-bg)' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '50px' }}>
                    <Heart size={36} color="var(--color-primary)" fill="var(--color-primary)" />
                    <div>
                        <h1 className="ui-title" style={{ marginBottom: '4px' }}>{t('title')}</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                            {favCars.length === 0
                                ? t('empty')
                                : t(favCars.length === 1 ? 'count_one' : 'count_other', { count: favCars.length })}
                        </p>
                    </div>
                </div>

                {favCars.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--color-white)', borderRadius: '16px', border: '1px dashed var(--color-gray-2)' }}>
                        <Heart size={64} color="var(--color-gray-2)" style={{ margin: '0 auto 20px' }} />
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-dark)' }}>
                            {t('empty_title')}
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>
                            {t('empty_text')}
                        </p>
                        <Link href="/inventory" className="btn btn-primary">{t('explore')}</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {favCars.map(car => {
                            const primaryImage = car.car_images?.find((img: any) => img.is_primary) || car.car_images?.[0];
                            const imageUrl = primaryImage?.url || '/media/content/b-goods/placeholder.jpg';

                            return (
                                <article key={car.id} style={{ background: 'var(--color-white)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-gray-2)', position: 'relative' }}>
                                    <button
                                        onClick={() => remove(car.id ?? '')}
                                        title={t('remove')}
                                        style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 5, background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                                    >
                                        <X size={16} />
                                    </button>

                                    <Link href={`/inventory/${car.slug}`}>
                                        <div style={{ position: 'relative', height: '200px' }}>
                                            <Image
                                                src={imageUrl}
                                                alt={`${car.brand} ${car.model}`}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                quality={75}
                                            />
                                            <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'var(--color-primary)', color: 'white', padding: '5px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: '800', fontFamily: 'var(--font-primary)' }}>
                                                {formatPrice(car.price)} €
                                            </div>
                                        </div>
                                    </Link>

                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
                                            {car.brand} {car.model}
                                        </h3>
                                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                                            {car.year} · {car.fuel_type} · {car.transmission}
                                        </p>
                                        <Link href={`/inventory/${car.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {t('view_details')} →
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
