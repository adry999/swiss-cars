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

export const SITE_NAME = 'SwissCars.md';

/** Open Graph and Twitter titles are not run through the layout's title.template, so they carry the site name themselves. */
export function withSiteName(title: string): string {
    return `${title} | ${SITE_NAME}`;
}

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
 * Next replaces a segment's whole `openGraph` object instead of merging it, so every field is set here.
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
        siteName: SITE_NAME,
        locale: OG_LOCALE_MAP[params.locale] || OG_LOCALE_MAP[routing.defaultLocale],
        url: localeUrl(params.locale, params.path ?? ''),
        title: params.title,
        description: params.description,
        images: [params.image ?? '/media/general/swiss-logo-2-red.png'],
    };
}

/** `twitter` for Next metadata; a page that omits it inherits the locale layout's homepage card. */
export function localeTwitter(params: { title: string; description: string; image?: string }) {
    return {
        card: 'summary_large_image' as const,
        title: params.title,
        description: params.description,
        images: [params.image ?? '/media/general/swiss-logo-2-red.png'],
    };
}

export type PageCopy = { title: string; description: string };

/** Title, description, canonical/hreflang, Open Graph and Twitter for a static page, from one copy table. */
export function localizedPageMetadata({
    locale,
    path,
    copyByLocale,
}: {
    locale: string;
    path: string;
    copyByLocale: Record<(typeof routing.locales)[number], PageCopy>;
}) {
    const { title, description } =
        copyByLocale[locale as (typeof routing.locales)[number]] ?? copyByLocale[routing.defaultLocale];

    return {
        title,
        description,
        alternates: localeAlternates(locale, path),
        openGraph: localeOpenGraph({ locale, path, title: withSiteName(title), description }),
        twitter: localeTwitter({ title: withSiteName(title), description }),
    };
}
