import { MetadataRoute } from 'next';
import { getCars } from '@/lib/supabase/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://swisscars.md';
    const locales = ['ro', 'ru', 'en'];

    // Static pages
    const staticPaths = ['', '/about', '/services', '/leasing', '/contact', '/inventory'];

    const staticEntries: MetadataRoute.Sitemap = [];
    for (const locale of locales) {
        for (const path of staticPaths) {
            const prefix = locale === 'ro' ? '' : `/${locale}`;
            staticEntries.push({
                url: `${baseUrl}${prefix}${path}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: path === '' ? 1 : 0.8,
            });
        }
    }

    // Dynamic car pages
    const cars = await getCars();
    const carEntries: MetadataRoute.Sitemap = [];
    for (const car of cars) {
        for (const locale of locales) {
            const prefix = locale === 'ro' ? '' : `/${locale}`;
            carEntries.push({
                url: `${baseUrl}${prefix}/inventory/${car.slug}`,
                lastModified: new Date(car.created_at || Date.now()),
                changeFrequency: 'monthly',
                priority: 0.7,
            });
        }
    }

    return [...staticEntries, ...carEntries];
}
