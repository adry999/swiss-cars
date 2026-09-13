import { z } from 'zod';
import { TranslatedFieldSchema } from '@shared/contracts/translated-field';

// Values already stored in the row can be null (a cleared number input is serialized as null),
// and the admin form sends the row back as it was loaded.
const OptionalText = z.string().nullish();

/**
 * The editable, public part of the `site_config` row.
 * Keys outside this schema are dropped on save, which keeps notification credentials out of the anon-readable row.
 */
export const SiteConfigSchema = z.object({
    site_title: OptionalText,
    site_description: OptionalText,
    phone: OptionalText,
    whatsapp: OptionalText,
    email: OptionalText,
    address: OptionalText,
    working_hours: OptionalText,
    working_days_closed: OptionalText,
    google_maps_embed: OptionalText,
    footer_phones: OptionalText,
    facebook: OptionalText,
    instagram: OptionalText,
    gtm_id: OptionalText,
    logo_url: OptionalText,
    logo_height: z.number().int().min(40).max(400).nullish(),
    header_height: z.number().int().min(60).max(300).nullish(),
    max_car_images: z.number().int().min(1).max(100).nullish(),
});

const HeroSlideSchema = z.object({
    imageSrc: z.string(),
    slogan: TranslatedFieldSchema,
    title: TranslatedFieldSchema,
    cta: TranslatedFieldSchema,
    ctaHref: z.string(),
});

const CounterSchema = z.number().int().min(0);

export const HomepageContentSchema = z.object({
    hero_slides: z.array(HeroSlideSchema),
    about_section: z.object({
        subtitle: TranslatedFieldSchema,
        title: TranslatedFieldSchema,
        text: TranslatedFieldSchema,
    }),
    stats_section: z.object({
        stats: z.array(
            z.object({
                count: CounterSchema,
                suffix: z.string(),
                label: TranslatedFieldSchema,
            }),
        ),
        partnerships: z.object({
            title: TranslatedFieldSchema,
            count: CounterSchema,
            suffix: TranslatedFieldSchema,
            text: TranslatedFieldSchema,
        }),
    }),
    services_section: z.object({
        title: TranslatedFieldSchema,
        imageSrc: z.string(),
        services: z.array(
            z.object({
                icon: z.string(),
                name: TranslatedFieldSchema,
                short: TranslatedFieldSchema,
                full: TranslatedFieldSchema,
            }),
        ),
    }),
    leasing_section: z.object({
        title: TranslatedFieldSchema,
        text1: TranslatedFieldSchema,
        text2: TranslatedFieldSchema,
    }),
    contact_banner: z.object({
        title: TranslatedFieldSchema,
        text: TranslatedFieldSchema,
        question: TranslatedFieldSchema,
        cta: TranslatedFieldSchema,
    }),
    why_us_section: z.object({
        title: TranslatedFieldSchema,
        items: z.array(
            z.object({
                title: TranslatedFieldSchema,
                text: TranslatedFieldSchema,
            }),
        ),
    }),
});
