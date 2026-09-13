import type { TranslatedField } from '@shared/contracts/translated-field';

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

/**
 * Fields that are safe to send to the browser.
 *
 * Anything not listed here is stripped by `getPublicSiteConfig()`. Server
 * Components serialize their props into the RSC payload, so passing the raw
 * `site_config` row to a client component publishes every field it contains.
 */
export interface PublicSiteConfig {
    site_title?: string;
    site_description?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    working_hours?: string;
    working_days_closed?: string;
    google_maps_embed?: string;
    /** Comma-separated list rendered in the footer. */
    footer_phones?: string;
    facebook?: string;
    instagram?: string;
    gtm_id?: string;
    logo_url?: string;
    logo_height?: number;
    header_height?: number;
    max_car_images?: number;
}

/** The full row, including credentials. Never pass this to a client component. */
export interface SiteConfig extends PublicSiteConfig {
    telegram_bot_token?: string;
    telegram_chat_id?: string;
    notification_email?: string;
}

export interface NotificationConfig {
    telegramBotToken?: string;
    telegramChatId?: string;
    notificationEmail?: string;
}
