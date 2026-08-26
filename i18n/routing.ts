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
