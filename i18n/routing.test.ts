import { describe, it, expect } from 'vitest';
import { routing, localeUrl, localeAlternates, localeOpenGraph, localeTwitter, localizedPageMetadata, withSiteName, BASE_URL, SITE_NAME } from './routing';

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
        const result = localeTwitter({ title: 'RU title', description: 'RU description' });
        expect(result.title).toBe('RU title');
        expect(result.description).toBe('RU description');
        expect(result.card).toBe('summary_large_image');
    });
});

describe('withSiteName', () => {
    it('appends the site name after a separator', () => {
        expect(withSiteName('Despre Noi')).toBe(`Despre Noi | ${SITE_NAME}`);
    });
});

describe('localizedPageMetadata', () => {
    const copyByLocale = {
        ro: { title: 'Despre Noi', description: 'Despre noi.' },
        ru: { title: 'О нас', description: 'О нас.' },
        en: { title: 'About Us', description: 'About us.' },
    };

    it('uses the copy of the requested locale everywhere', () => {
        const metadata = localizedPageMetadata({ locale: 'ru', path: '/about', copyByLocale });

        expect(metadata.title).toBe('О нас');
        expect(metadata.description).toBe('О нас.');
        expect(metadata.openGraph.title).toBe('О нас | SwissCars.md');
        expect(metadata.twitter.title).toBe('О нас | SwissCars.md');
        expect(metadata.twitter.description).toBe('О нас.');
        expect(metadata.alternates.canonical).toBe(`${BASE_URL}/ru/about`);
    });

    it('falls back to the Romanian copy for an unknown locale', () => {
        const metadata = localizedPageMetadata({ locale: 'de', path: '/about', copyByLocale });

        expect(metadata.title).toBe('Despre Noi');
    });
});
