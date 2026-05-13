import { getTranslations, getLocale } from 'next-intl/server';
import { getSettings } from '@/lib/actions/settings';
import WhyUsAccordionClient from './WhyUsAccordionClient';

export default async function WhyUsAccordion() {
    const t = await getTranslations('whyus');
    const locale = await getLocale();

    const homepageData = await getSettings('homepage_content') || {};
    const data = homepageData.why_us_section || null;

    const getText = (translations?: Record<string, string>, fallbackKey?: string) => {
        if (translations && translations[locale]) return translations[locale];
        if (translations && translations['ro']) return translations['ro'];
        return fallbackKey ? t(fallbackKey) : '';
    };

    const title = getText(data?.title, 'title');

    const defaultItems = [
        { title: t('q1_title'), text: t('q1_text') },
        { title: t('q2_title'), text: t('q2_text') },
        { title: t('q3_title'), text: t('q3_text') },
        { title: t('q4_title'), text: t('q4_text') }
    ];

    const items = (data?.items || []).length > 0
        ? data.items.map((item: any) => ({
            title: getText(item.title),
            text: getText(item.text)
        }))
        : defaultItems;

    return <WhyUsAccordionClient title={title} items={items} />;
}
