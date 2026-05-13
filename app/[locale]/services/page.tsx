import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { PackageSearch, ShieldCheck, Truck, CarFront, Wrench, HeadphonesIcon } from 'lucide-react';
import styles from './page.module.css';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const meta: Record<string, { title: string; description: string }> = {
        ro: { title: 'Servicii', description: 'Servicii complete de import auto din Elveția, devamare, transport și mentenanță.' },
        ru: { title: 'Услуги', description: 'Полный спектр услуг по импорту автомобилей из Швейцарии, растаможке, транспортировке и обслуживанию.' },
        en: { title: 'Services', description: 'Complete car import services from Switzerland, customs clearance, transport and maintenance.' },
    };
    const current = meta[locale] || meta.ro;
    return {
        title: `${current.title} | SwissCars.md`,
        description: current.description,
    };
}

export default async function ServicesPage() {
    const t = await getTranslations('services');

    const services = [
        { icon: PackageSearch, title: t('service1_name'), desc: t('service1_full') },
        { icon: ShieldCheck, title: t('service2_name'), desc: t('service2_full') },
        { icon: Truck, title: t('service3_name'), desc: t('service3_full') },
        { icon: CarFront, title: t('service4_name'), desc: t('service4_full') },
        { icon: Wrench, title: t('service5_name'), desc: t('service5_full') },
        { icon: HeadphonesIcon, title: t('service6_name'), desc: t('service6_full') },
    ];

    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className="ui-title">{t('title')}</h1>
                    <div className={`ui-decor ${styles.decor}`} />
                </div>

                <div className={styles.grid}>
                    {services.map((srv, idx) => (
                        <div key={idx} className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <srv.icon size={28} />
                            </div>
                            <h3 className={styles.title}>{srv.title}</h3>
                            <p className={styles.desc}>{srv.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
