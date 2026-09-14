import { getTranslations, getLocale } from 'next-intl/server';
import { getHomepageContent } from '../server/site-settings-repository';
import { pickTranslation } from '@shared/formatting/pick-translation';
import styles from './AboutSection.module.css';

export default async function AboutSection() {
    const t = await getTranslations('about');
    const locale = await getLocale();

    const homepageData = await getHomepageContent();
    const aboutData = homepageData.about_section || null;

    const subtitle = pickTranslation(aboutData?.subtitle, locale) ?? t('subtitle');
    const title = pickTranslation(aboutData?.title, locale) ?? t('title');
    const text = pickTranslation(aboutData?.text, locale) ?? t('text');

    const advantages = [
        { icon: '🔒', key: 'advantage1' as const },
        { icon: '🚗', key: 'advantage2' as const },
        { icon: '🛠️', key: 'advantage3' as const },
    ];

    return (
        <section className={`section ${styles.section}`} id="about-us">
            <div className="container">
                <div className="section-header">
                    <p className="ui-subtitle">{subtitle}</p>
                    <h2 className="ui-title">{title}</h2>
                    <div className="ui-decor" />
                    <p className={styles.text}>{text}</p>
                </div>

                <div className={styles.advantages}>
                    {advantages.map((adv, i) => (
                        <div
                            key={adv.key}
                            className={`${styles.advantageCard} ${i === 1 ? styles.advantageActive : ''}`}
                        >
                            <span className={styles.icon}>{adv.icon}</span>
                            <h3 className={styles.advantageTitle}>{t(adv.key)}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
