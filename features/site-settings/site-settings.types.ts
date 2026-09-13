import type { z } from 'zod';
import type { ActionResult } from '@shared/contracts/action-result';
import type { HomepageContentSchema } from './site-settings.schema';

// HomepageContent — the shape stored in site_settings under key 'homepage_content'
export type HomepageContent = z.infer<typeof HomepageContentSchema>;

// HeroSlide — used by HeroSlider component and HomepageForm
export type HeroSlide = HomepageContent['hero_slides'][number];

export type SiteSettingsSaveResult = ActionResult<'invalid-input' | 'unavailable'>;

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
