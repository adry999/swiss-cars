import { getTranslations, getLocale } from 'next-intl/server';
import { getHomepageContent } from '../server/site-settings-repository';
import { pickTranslation } from '@shared/formatting/pick-translation';
import styles from './LeasingSection.module.css';

export default async function LeasingSection() {
    const t = await getTranslations('leasing');
    const locale = await getLocale();

    const homepageData = await getHomepageContent();
    const data = homepageData.leasing_section || null;

    const title = pickTranslation(data?.title, locale) ?? t('title');
    const text1 = pickTranslation(data?.text1, locale) ?? t('text1');
    const text2 = pickTranslation(data?.text2, locale) ?? t('text2');

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
