import { MetadataRoute } from 'next';
import { getCars } from '@/lib/supabase/queries';
import { routing, localeUrl } from '@/i18n/routing';

const STATIC_PATHS = ['', '/about', '/services', '/leasing', '/contact', '/inventory'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Prefixes come from the routing config, so the sitemap can no longer drift
    // from it. Under localePrefix 'never' this file emitted /ru and /en URLs
    // that all redirected to /.
    const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
        url: localeUrl(routing.defaultLocale, path),
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.8,
        alternates: {
            languages: Object.fromEntries(
                routing.locales.map((locale) => [locale, localeUrl(locale, path)])
            ),
        },
    }));

    const cars = await getCars();
    const carEntries: MetadataRoute.Sitemap = cars
        .filter((car) => car.slug)
        .map((car) => {
            const path = `/inventory/${car.slug}`;
            return {
                url: localeUrl(routing.defaultLocale, path),
                lastModified: car.created_at ? new Date(car.created_at) : undefined,
                changeFrequency: 'monthly' as const,
                priority: 0.7,
                alternates: {
                    languages: Object.fromEntries(
                        routing.locales.map((locale) => [locale, localeUrl(locale, path)])
                    ),
                },
            };
        });

    return [...staticEntries, ...carEntries];
}
