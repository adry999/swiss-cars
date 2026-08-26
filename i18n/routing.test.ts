import { describe, it, expect } from 'vitest';
import { routing, localeUrl, localeAlternates, localeOpenGraph, localeTwitter, BASE_URL } from './routing';

describe('routing config', () => {
    it('uses as-needed prefixing with Romanian as the default', () => {
        expect(routing.localePrefix).toBe('as-needed');
        expect(routing.defaultLocale).toBe('ro');
        expect(routing.locales).toEqual(['ro', 'ru', 'en']);
    });
});

describe('localeUrl', () => {
    it('omits the prefix for the default locale', () => {
        expect(localeUrl('ro')).toBe(BASE_URL);
        expect(localeUrl('ro', '/about')).toBe(`${BASE_URL}/about`);
    });

    it('prefixes non-default locales', () => {
        expect(localeUrl('ru', '/about')).toBe(`${BASE_URL}/ru/about`);
        expect(localeUrl('en', '/inventory/bmw-x5')).toBe(`${BASE_URL}/en/inventory/bmw-x5`);
    });

    it('defaults to the root path when none is given', () => {
        expect(localeUrl('en')).toBe(`${BASE_URL}/en`);
    });
});

describe('localeAlternates', () => {
    it('sets canonical to the current locale/path combination', () => {
        // This was the actual bug: pages that didn't pass a path-specific
        // override inherited the layout's canonical for the homepage
        // regardless of what page they were. Every caller must pass its own
        // path, and this locks the shape in.
        const result = localeAlternates('ru', '/about');
        expect(result.canonical).toBe(`${BASE_URL}/ru/about`);
    });

    it('emits one hreflang entry per locale plus x-default', () => {
        const result = localeAlternates('en', '/services');
        expect(result.languages).toEqual({
            ro: `${BASE_URL}/services`,
            ru: `${BASE_URL}/ru/services`,
            en: `${BASE_URL}/en/services`,
            'x-default': `${BASE_URL}/services`,
        });
    });
});

describe('localeOpenGraph', () => {
    it('sets url from locale+path rather than leaving it unset', () => {
        // Confirmed live: omitting `url` here left og:url entirely absent
        // on every page, because Next replaces a segment's whole
        // openGraph object rather than merging it with an ancestor's.
        const result = localeOpenGraph({ locale: 'ru', path: '/about', title: 't', description: 'd' });
        expect(result.url).toBe(`${BASE_URL}/ru/about`);
    });

    it('maps to the correct og:locale for each supported language', () => {
        expect(localeOpenGraph({ locale: 'ro', title: 't', description: 'd' }).locale).toBe('ro_RO');
        expect(localeOpenGraph({ locale: 'ru', title: 't', description: 'd' }).locale).toBe('ru_RU');
        expect(localeOpenGraph({ locale: 'en', title: 't', description: 'd' }).locale).toBe('en_US');
    });

    it('falls back to the default-locale og:locale for an unknown locale', () => {
        expect(localeOpenGraph({ locale: 'fr', title: 't', description: 'd' }).locale).toBe('ro_RO');
    });

    it('falls back to the site logo when no image is given', () => {
        const result = localeOpenGraph({ locale: 'ro', title: 't', description: 'd' });
        expect(result.images).toEqual(['/media/general/swiss-logo-2-red.png']);
    });

    it('uses a provided image over the fallback', () => {
        const result = localeOpenGraph({ locale: 'ro', title: 't', description: 'd', image: 'https://x/car.jpg' });
        expect(result.images).toEqual(['https://x/car.jpg']);
    });
});

describe('localeTwitter', () => {
    it('carries the given title/description rather than a hardcoded one', () => {
        // Confirmed live: pages under [locale] never defined their own
        // `twitter` block, so every locale — Russian and English included —
        // inherited the root layout's hardcoded Romanian title/description.
        const result = localeTwitter({ title: 'RU title', description: 'RU description' });
        expect(result.title).toBe('RU title');
        expect(result.description).toBe('RU description');
        expect(result.card).toBe('summary_large_image');
    });
});
