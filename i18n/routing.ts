import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['ro', 'ru', 'en'],
    defaultLocale: 'ro',
    // 'never' put all three languages on the same URL, chosen by cookie. Search
    // engines could therefore only ever index Romanian, hreflang was impossible,
    // and the sitemap advertised /ru and /en paths that redirected to /.
    //
    // 'as-needed' keeps every existing Romanian URL exactly as it was and adds
    // /ru/* and /en/* alongside them, so this is additive — no redirects needed.
    localePrefix: 'as-needed',
});

export const BASE_URL = 'https://swisscars.md';

/** Absolute URL for a path in a given locale. Romanian carries no prefix. */
export function localeUrl(locale: string, path = ''): string {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    return `${BASE_URL}${prefix}${path}`;
}

/**
 * `alternates` for Next metadata: canonical for the current locale plus an
 * hreflang entry per language.
 */
export function localeAlternates(locale: string, path = '') {
    return {
        canonical: localeUrl(locale, path),
        languages: {
            ...Object.fromEntries(
                routing.locales.map((code) => [code, localeUrl(code, path)])
            ),
            'x-default': localeUrl(routing.defaultLocale, path),
        },
    };
}

const OG_LOCALE_MAP: Record<string, string> = { ro: 'ro_RO', ru: 'ru_RU', en: 'en_US' };

/**
 * `openGraph` for Next metadata, locale- and path-aware.
 *
 * Next replaces a segment's whole `openGraph` object rather than
 * deep-merging it with an ancestor's — a page that defines its own
 * `openGraph` loses whatever the layout set (siteName, url, type, …)
 * unless it's repeated here. Confirmed live: pages that didn't override this
 * inherited the locale layout's openGraph object, which never set `url` at
 * all, so `og:url` was simply absent on every page under [locale].
 */
export function localeOpenGraph(params: {
    locale: string;
    path?: string;
    title: string;
    description: string;
    image?: string;
}) {
    return {
        type: 'website' as const,
        siteName: 'SwissCars.md',
        locale: OG_LOCALE_MAP[params.locale] || OG_LOCALE_MAP[routing.defaultLocale],
        url: localeUrl(params.locale, params.path ?? ''),
        title: params.title,
        description: params.description,
        images: [params.image ?? '/media/general/swiss-logo-2-red.png'],
    };
}

/**
 * `twitter` for Next metadata, locale-aware.
 *
 * Confirmed live: pages under [locale] never defined their own `twitter`
 * block, so every locale — Russian and English included — inherited the
 * root layout's hardcoded Romanian title/description.
 */
export function localeTwitter(params: { title: string; description: string; image?: string }) {
    return {
        card: 'summary_large_image' as const,
        title: params.title,
        description: params.description,
        images: [params.image ?? '/media/general/swiss-logo-2-red.png'],
    };
}
