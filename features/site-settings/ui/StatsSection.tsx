import { getTranslations, getLocale } from 'next-intl/server';
import { getHomepageContent, getPublicSiteConfig } from '../server/site-settings-repository';
import { pickTranslation } from '@shared/formatting/pick-translation';
import StatsSectionClient from './StatsSectionClient';

export default async function StatsSection() {
    const t = await getTranslations('stats');
    const locale = await getLocale();

    const homepageData = await getHomepageContent();
    const siteConfig = await getPublicSiteConfig();
    const statsData = homepageData.stats_section || null;
    const phone = siteConfig.phone;

    // Prepare default data if database is empty
    const stats = statsData?.stats || [
        { count: 500, suffix: '+', label: { ro: t('cars_label') } },
        { count: 265, suffix: '', label: { ro: t('transport_label') } },
        { count: 1450, suffix: '', label: { ro: t('discounted_label') } }
    ];

    const partnerships = statsData?.partnerships || {
        title: { ro: t('partnerships_title') },
        count: 50,
        suffix: { ro: t('partnerships_suffix') },
        text: { ro: t('partnerships_text') }
    };

    const finalStats = stats.map((stat) => ({
        count: stat.count,
        suffix: stat.suffix,
        label: pickTranslation(stat.label, locale) ?? ''
    }));

    const finalPartnerships = {
        title: pickTranslation(partnerships.title, locale) ?? '',
        count: partnerships.count,
        suffix: pickTranslation(partnerships.suffix, locale) ?? '',
        text: pickTranslation(partnerships.text, locale) ?? ''
    };

    return (
        <StatsSectionClient
            stats={finalStats}
            partnerships={finalPartnerships}
            questionLabel={t('question')}
            phoneLabel={t('phone')}
            phone={phone}
        />
    );
}
