import { z } from 'zod';

// Zod schema for car translations
export const TranslatedFieldSchema = z.object({
    ro: z.string(),
    ru: z.string().optional(),
    en: z.string().optional(),
});

export type TranslatedField = z.infer<typeof TranslatedFieldSchema>;

// HeroSlide — used by HeroSlider component and HomepageForm
export interface HeroSlide {
    imageSrc: string;
    slogan: TranslatedField;
    title: TranslatedField;
    cta: TranslatedField;
    ctaHref: string;
}

// HomepageContent — the shape stored in site_settings under key 'homepage_content'
export interface HomepageContent {
    hero_slides: HeroSlide[];
    about_section: {
        subtitle: TranslatedField;
        title: TranslatedField;
        text: TranslatedField;
    };
    stats_section: {
        stats: Array<{
            count: number;
            suffix: string;
            label: TranslatedField;
        }>;
        partnerships: {
            title: TranslatedField;
            count: number;
            suffix: TranslatedField;
            text: TranslatedField;
        };
    };
    services_section: {
        title: TranslatedField;
        imageSrc: string;
        services: Array<{
            icon: string;
            name: TranslatedField;
            short: TranslatedField;
            full: TranslatedField;
        }>;
    };
    leasing_section: {
        title: TranslatedField;
        text1: TranslatedField;
        text2: TranslatedField;
    };
    contact_banner: {
        title: TranslatedField;
        text: TranslatedField;
        question: TranslatedField;
        cta: TranslatedField;
    };
    why_us_section: {
        title: TranslatedField;
        items: Array<{
            title: TranslatedField;
            text: TranslatedField;
        }>;
    };
}
