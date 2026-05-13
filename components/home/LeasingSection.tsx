import { getTranslations, getLocale } from 'next-intl/server';
import { getSettings } from '@/lib/actions/settings';
import styles from './LeasingSection.module.css';

export default async function LeasingSection() {
    const t = await getTranslations('leasing');
    const locale = await getLocale();

    const homepageData = await getSettings('homepage_content') || {};
    const data = homepageData.leasing_section || null;

    const getText = (translations?: Record<string, string>, fallbackKey?: string) => {
        if (translations && translations[locale]) return translations[locale];
        if (translations && translations['ro']) return translations['ro'];
        return fallbackKey ? t(fallbackKey) : '';
    };

    const title = getText(data?.title, 'title');
    const text1 = getText(data?.text1, 'text1');
    const text2 = getText(data?.text2, 'text2');

    return (
        <section className={`section ${styles.section}`}>
            <div className="container">
                <div className="section-header">
                    <h2 className="ui-title">{title}</h2>
                    <div className="ui-decor" />
                </div>
                <div className={styles.grid}>
                    <p>{text1}</p>
                    <p>{text2}</p>
                </div>
            </div>
        </section>
    );
}
