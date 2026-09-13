import { getTranslations, getLocale } from 'next-intl/server';
import { getHomepageContent } from '@/lib/settings';
import type { TranslatedField } from '@/lib/types';
import ServicesSectionClient from './ServicesSectionClient';

type ServiceEntry = {
    icon?: string;
    name?: TranslatedField;
    short?: TranslatedField;
    full?: TranslatedField;
};

const SERVICE_KEYS = [
    { key: 'service1', icon: '🔍' },
    { key: 'service2', icon: '🔧' },
    { key: 'service3', icon: '🚚' },
    { key: 'service4', icon: '🏷️' },
    { key: 'service5', icon: '⚙️' },
    { key: 'service6', icon: '🛡️' },
];

export default async function ServicesSection() {
    const t = await getTranslations('services');
    const locale = await getLocale();

    const homepageData = await getHomepageContent();
    const servicesData = homepageData.services_section || null;

    // Helper: get translated value from object or fall back to i18n key
    const getText = (translations?: Record<string, string> | null, fallbackKey?: string): string => {
        if (translations && typeof translations === 'object') {
            if (translations[locale]) return translations[locale];
            if (translations['ro']) return translations['ro'];
        }
        if (typeof translations === 'string' && (translations as string).length > 0) return translations as string;
        if (fallbackKey) {
            try { return t(fallbackKey); } catch { return ''; }
        }
        return '';
    };

    const title = getText(servicesData?.title, 'title');
    const imageSrc = servicesData?.imageSrc || '/media/content/b-services/fig-1.png';

    // Use admin services if configured, otherwise fall back to i18n
    const rawServices = servicesData?.services && servicesData.services.length > 0
        ? servicesData.services
        : SERVICE_KEYS;

    const services: { icon: string; name: string; short: string; full: string }[] = rawServices.map((s: ServiceEntry, idx) => {
        const defaultKey = SERVICE_KEYS[idx]?.key || `service${idx + 1}`;
        const icon = s.icon || SERVICE_KEYS[idx]?.icon || '⭐';
        const name = getText(s.name, `${defaultKey}_name`);
        const short = getText(s.short, `${defaultKey}_short`);
        const fullText = getText(s.full, `${defaultKey}_full`);
        return { icon, name, short, full: fullText };
    });

    return (
        <ServicesSectionClient
            title={title}
            imageSrc={imageSrc}
            services={services}
        />
    );
}
