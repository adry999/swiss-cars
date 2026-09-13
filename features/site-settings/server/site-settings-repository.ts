import { cache } from 'react';
import { getServerEnvironment } from '@config/server-environment';
import { createStaticSupabaseClient } from '@core/supabase/server-client';
import type { HomepageContent, NotificationConfig, PublicSiteConfig, SiteConfig } from '../site-settings.types';

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
    const supabase = createStaticSupabaseClient();
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

// Partial, not HomepageContent: this is a hand-edited JSON blob, not
// something Zod validates on the way in, so any section can legitimately be
// missing (a fresh install, a partially-filled admin form). Every reader
// already falls back to defaults when a section is absent — this type just
// makes that the compiler's problem instead of `any`'s.
export async function getHomepageContent(): Promise<Partial<HomepageContent>> {
    return ((await getSettingRow('homepage_content')) ?? {}) as Partial<HomepageContent>;
}

/**
 * Notification credentials, environment variables first.
 *
 * The database fallback exists only so existing deployments keep working while
 * secrets are migrated out of `site_config`; remove it once the row is cleaned.
 */
export async function getNotificationConfig(): Promise<NotificationConfig> {
    const { telegram, notificationEmail } = getServerEnvironment();

    if (telegram) {
        return {
            telegramBotToken: telegram.botToken,
            telegramChatId: telegram.chatId,
            notificationEmail: notificationEmail ?? undefined,
        };
    }

    const config = await getSiteConfig();
    return {
        telegramBotToken: config.telegram_bot_token,
        telegramChatId: config.telegram_chat_id,
        notificationEmail: notificationEmail ?? config.notification_email,
    };
}
