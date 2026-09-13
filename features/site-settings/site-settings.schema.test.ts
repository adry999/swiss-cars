import { describe, expect, it } from 'vitest';
import { HomepageContentSchema, SiteConfigSchema } from './site-settings.schema';

const text = (ro: string) => ({ ro, ru: '', en: '' });

function buildHomepageContent() {
    return {
        hero_slides: [{ imageSrc: '/slide.png', slogan: text('Slogan'), title: text('Titlu'), cta: text('Vezi'), ctaHref: '#offers' }],
        about_section: { subtitle: text('Despre'), title: text('Cine suntem'), text: text('Text') },
        stats_section: {
            stats: [{ count: 500, suffix: '+', label: text('Mașini importate') }],
            partnerships: { title: text('Peste'), count: 150, suffix: text('parteneriate'), text: text('Text') },
        },
        services_section: {
            title: text('Servicii'),
            imageSrc: '/services.png',
            services: [{ icon: '🔧', name: text('Verificare'), short: text('Completă'), full: text('Detalii') }],
        },
        leasing_section: { title: text('Leasing'), text1: text('Unu'), text2: text('Doi') },
        contact_banner: { title: text('Oferte'), text: text('Text'), question: text('Întrebări?'), cta: text('Sună') },
        why_us_section: { title: text('De ce noi?'), items: [{ title: text('Calitate'), text: text('Text') }] },
    };
}

describe('SiteConfigSchema', () => {
    it('accepts the config the admin form loads, including values stored as null', () => {
        const result = SiteConfigSchema.safeParse({
            site_title: 'SwissCars.md',
            phone: '+41 78 323 31 50',
            gtm_id: '',
            logo_height: 80,
            header_height: 80,
            max_car_images: null,
        });

        expect(result.success).toBe(true);
    });

    it('drops notification credentials so they are never written back into the public row', () => {
        const result = SiteConfigSchema.parse({
            site_title: 'SwissCars.md',
            telegram_bot_token: '123:secret',
            telegram_chat_id: '42',
            notification_email: 'sales@example.md',
        });

        expect(result).toEqual({ site_title: 'SwissCars.md' });
    });

    it('rejects a logo height outside the range the admin slider offers', () => {
        const result = SiteConfigSchema.safeParse({ logo_height: 1000 });

        expect(result.success).toBe(false);
    });

    it('rejects a max image count that is not a whole number', () => {
        const result = SiteConfigSchema.safeParse({ max_car_images: Number.NaN });

        expect(result.success).toBe(false);
    });
});

describe('HomepageContentSchema', () => {
    it('accepts a complete homepage', () => {
        expect(HomepageContentSchema.safeParse(buildHomepageContent()).success).toBe(true);
    });

    it('points at the counter left empty in the editor', () => {
        const content = buildHomepageContent();
        content.stats_section.stats[0].count = Number.NaN;

        const result = HomepageContentSchema.safeParse(content);

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['stats_section', 'stats', 0, 'count']);
    });

    it('rejects a homepage with a missing section', () => {
        const withoutLeasing = Object.fromEntries(
            Object.entries(buildHomepageContent()).filter(([section]) => section !== 'leasing_section'),
        );

        expect(HomepageContentSchema.safeParse(withoutLeasing).success).toBe(false);
    });

    it('rejects a section stored as plain text instead of an object', () => {
        expect(HomepageContentSchema.safeParse({ ...buildHomepageContent(), about_section: 'about' }).success).toBe(false);
    });
});
