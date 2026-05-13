import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { Partner } from '@/lib/types';
import styles from './PartnersSlider.module.css';

type Props = { partners: Partner[] };

export default function PartnersSlider({ partners }: Props) {
    const t = useTranslations('partners');

    if (partners.length === 0) return null;

    // Duplicate for infinite scroll effect
    const doubled = [...partners, ...partners];

    return (
        <section className={`section ${styles.section}`}>
            <div className="container">
                <div className="section-header">
                    <h2 className="ui-title">{t('title')}</h2>
                    <div className="ui-decor" />
                </div>
            </div>
            <div className={styles.track}>
                <div className={styles.logos}>
                    {doubled.map((p, i) => (
                        <div key={`${p.id}-${i}`} className={styles.logo}>
                            {p.logo_url ? (
                                <Image
                                    src={p.logo_url}
                                    alt={p.name || 'Partner'}
                                    width={140}
                                    height={60}
                                    className={styles.logoImg}
                                    quality={70}
                                />
                            ) : (
                                <span className={styles.logoText}>{p.name}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
