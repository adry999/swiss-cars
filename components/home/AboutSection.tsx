import { getTranslations, getLocale } from 'next-intl/server';
import { getSettings } from '@/lib/actions/settings';
import styles from './AboutSection.module.css';

export default async function AboutSection() {
    const t = await getTranslations('about');
    const locale = await getLocale();

    const homepageData = await getSettings('homepage_content') || {};
    const aboutData = homepageData.about_section || null;

    const getText = (translations?: Record<string, string>, fallbackKey?: string) => {
        if (translations && translations[locale]) return translations[locale];
        if (translations && translations['ro']) return translations['ro'];
        return fallbackKey ? t(fallbackKey) : '';
    };

    const subtitle = getText(aboutData?.subtitle, 'subtitle');
    const title = getText(aboutData?.title, 'title');
    const text = getText(aboutData?.text, 'text');

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
