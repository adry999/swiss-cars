import { getTranslations, getLocale } from 'next-intl/server';
import { getHomepageContent } from '../server/site-settings-repository';
import { pickTranslation } from '@shared/formatting/pick-translation';
import WhyUsAccordionClient from './WhyUsAccordionClient';

export default async function WhyUsAccordion() {
    const t = await getTranslations('whyus');
    const locale = await getLocale();

    const homepageData = await getHomepageContent();
    const data = homepageData.why_us_section || null;

    const title = pickTranslation(data?.title, locale) ?? t('title');

    const defaultItems = [
        { title: t('q1_title'), text: t('q1_text') },
        { title: t('q2_title'), text: t('q2_text') },
        { title: t('q3_title'), text: t('q3_text') },
        { title: t('q4_title'), text: t('q4_text') }
    ];

    const items = data?.items && data.items.length > 0
        ? data.items.map((item) => ({
            title: pickTranslation(item.title, locale) ?? '',
            text: pickTranslation(item.text, locale) ?? ''
        }))
        : defaultItems;

    return <WhyUsAccordionClient title={title} items={items} />;
}
