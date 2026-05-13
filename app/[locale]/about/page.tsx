import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { ShieldCheck, Zap, Globe, Search, ClipboardCheck, Truck, ChevronRight } from 'lucide-react';
import styles from './about.module.css';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const meta: Record<string, { title: string; description: string }> = {
        ro: { title: 'Despre Noi', description: 'Află mai multe despre misiunea noastră și experiența în importul auto din Elveția.' },
        ru: { title: 'О нас', description: 'Узнайте больше о нашей миссии и опыте импорта автомобилей из Швейцарии.' },
        en: { title: 'About Us', description: 'Learn more about our mission and experience in importing cars from Switzerland.' },
    };
    const current = meta[locale] || meta.ro;
    return {
        title: `${current.title} | SwissCars.md`,
        description: current.description,
    };
}

export default async function AboutPage() {
    const t = await getTranslations('about');

    return (
        <main className={styles.main}>
            {/* 1. Hero Section */}
            <section className={styles.hero}>
                <Image
                    src="/media/content/about/showroom.jpg"
                    alt="SwissCars Showroom"
                    fill
                    priority
                    sizes="100vw"
                    quality={85}
                    className={styles.heroImage}
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>{t('title')}</h1>
                    <p className={styles.heroSubtitle}>
                        Experiență premium în importul și consultanța auto din Elveția către Moldova.
                    </p>
                </div>
            </section>

            {/* 2. Mission & Intro */}
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.missionGrid}>
                        <div>
                            <h2 className={styles.missionTitle}>{t('mission_title')}</h2>
                            <p className={styles.missionText}>{t('mission_text')}</p>
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <span className={styles.statNumber}>10+</span>
                                    <span className={styles.statLabel}>{t('years_experience')}</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statNumber}>500+</span>
                                    <span className={styles.statLabel}>{t('cars_delivered')}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ position: 'relative', height: '400px', borderRadius: '24px', overflow: 'hidden' }}>
                            <Image
                                src="/media/content/b-services/fig-1.png"
                                alt="Service Delivery"
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                quality={80}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Values Section */}
            <section className={`${styles.section} styles.sectionGray`}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="ui-title">{t('values_title')}</h2>
                        <div className="ui-decor" style={{ margin: '15px auto 0' }} />
                    </div>

                    <div className={styles.valuesGrid}>
                        <div className={styles.valueCard}>
                            <div className={styles.valueIcon}><Globe size={32} /></div>
                            <h3 className={styles.valueTitle}>{t('value1_title')}</h3>
                            <p className={styles.valueText}>{t('value1_text')}</p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.valueIcon}><ShieldCheck size={32} /></div>
                            <h3 className={styles.valueTitle}>{t('value2_title')}</h3>
                            <p className={styles.valueText}>{t('value2_text')}</p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.valueIcon}><Zap size={32} /></div>
                            <h3 className={styles.valueTitle}>{t('value3_title')}</h3>
                            <p className={styles.valueText}>{t('value3_text')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. How We Work / Timeline */}
            <section className={styles.section}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="ui-title">{t('how_it_works')}</h2>
                        <div className="ui-decor" style={{ margin: '15px auto 0' }} />
                    </div>

                    <div className={styles.timeline}>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineDot} />
                            <div className={styles.timelineContent}>
                                <h4>1. {t('step1_title')}</h4>
                                <p>{t('step1_text')}</p>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineDot} />
                            <div className={styles.timelineContent}>
                                <h4>2. {t('step2_title')}</h4>
                                <p>{t('step2_text')}</p>
                            </div>
                        </div>
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineDot} />
                            <div className={styles.timelineContent}>
                                <h4>3. {t('step3_title')}</h4>
                                <p>{t('step3_text')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. CTA Section */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <h2 className={styles.ctaTitle}>{t('cta_title')}</h2>
                    <div className={styles.ctaButtons}>
                        <Link href="/inventory" className="btn btn-primary btn-lg">
                            {t('cta_button')} <ChevronRight size={18} />
                        </Link>
                        <Link href="/contact" className="btn btn-outline btn-lg">
                            {t('contact_label', { defaultValue: 'Contactează-ne' })}
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
