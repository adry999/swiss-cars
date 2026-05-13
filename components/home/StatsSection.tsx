import { getTranslations, getLocale } from 'next-intl/server';
import { getSettings } from '@/lib/actions/settings';
import StatsSectionClient from './StatsSectionClient';

export default async function StatsSection() {
    const t = await getTranslations('stats');
    const locale = await getLocale();

    const homepageData = await getSettings('homepage_content') || {};
    const siteConfig = await getSettings('site_config') || {};
    const statsData = homepageData.stats_section || null;
    const phone = siteConfig.phone;

    const getText = (translations?: Record<string, string>, fallbackKey?: string) => {
        if (translations && translations[locale]) return translations[locale];
        if (translations && translations['ro']) return translations['ro'];
        return fallbackKey ? t(fallbackKey) : '';
    };

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

    const finalStats = stats.map((stat: any) => ({
        count: stat.count,
        suffix: stat.suffix,
        label: getText(stat.label)
    }));

    const finalPartnerships = {
        title: getText(partnerships.title),
        count: partnerships.count,
        suffix: getText(partnerships.suffix),
        text: getText(partnerships.text)
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
