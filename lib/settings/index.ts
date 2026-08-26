import { cache } from 'react';
import { createStaticClient } from '@/lib/supabase/server';

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

const PUBLIC_KEYS = [
    'site_title',
    'site_description',
    'phone',
    'whatsapp',
    'email',
    'address',
    'working_hours',
    'working_days_closed',
    'google_maps_embed',
    'footer_phones',
    'facebook',
    'instagram',
    'gtm_id',
    'logo_url',
    'logo_height',
    'header_height',
    'max_car_images',
] as const satisfies readonly (keyof PublicSiteConfig)[];

/**
 * Reads one `site_settings` row.
 *
 * Wrapped in `React.cache` so repeated calls within a single request hit the
 * database once. The homepage alone used to issue ~12 identical queries.
 */
const getSettingRow = cache(async (key: string): Promise<Record<string, unknown> | null> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

    if (error) {
        console.error(`Error fetching settings key "${key}":`, error);
        return null;
    }
    return (data?.value as Record<string, unknown>) ?? null;
});

/** Full config including credentials. Server-side use only. */
export async function getSiteConfig(): Promise<SiteConfig> {
    return ((await getSettingRow('site_config')) ?? {}) as SiteConfig;
}

/** Config with credentials stripped. Use this for anything reaching the browser. */
export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
    const full = await getSiteConfig();
    const publicConfig: PublicSiteConfig = {};

    for (const key of PUBLIC_KEYS) {
        const value = full[key];
        if (value !== undefined && value !== null && value !== '') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (publicConfig as any)[key] = value;
        }
    }

    return publicConfig;
}

// TODO: type against `HomepageContent` in lib/types once the section
// components stop indexing this blob loosely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getHomepageContent(): Promise<Record<string, any>> {
    return (await getSettingRow('homepage_content')) ?? {};
}

export interface NotificationConfig {
    telegramBotToken?: string;
    telegramChatId?: string;
    notificationEmail?: string;
}

/**
 * Notification credentials, environment variables first.
 *
 * The database fallback exists only so existing deployments keep working while
 * secrets are migrated out of `site_config`; remove it once the row is cleaned.
 */
export async function getNotificationConfig(): Promise<NotificationConfig> {
    const fromEnv: NotificationConfig = {
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
        telegramChatId: process.env.TELEGRAM_CHAT_ID,
        notificationEmail: process.env.NOTIFICATION_EMAIL,
    };

    if (fromEnv.telegramBotToken && fromEnv.telegramChatId) {
        return fromEnv;
    }

    const config = await getSiteConfig();
    return {
        telegramBotToken: fromEnv.telegramBotToken || config.telegram_bot_token,
        telegramChatId: fromEnv.telegramChatId || config.telegram_chat_id,
        notificationEmail: fromEnv.notificationEmail || config.notification_email,
    };
}
