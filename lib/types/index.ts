import { z } from 'zod';

// Zod schema for car translations
export const TranslatedFieldSchema = z.object({
    ro: z.string(),
    ru: z.string().optional(),
    en: z.string().optional(),
});

export type TranslatedField = z.infer<typeof TranslatedFieldSchema>;

// Car Schema
export const CarSchema = z.object({
    id: z.string().uuid().optional(),
    slug: z.string().min(1),
    brand: z.string().min(1),
    model: z.string().min(1),
    year: z.preprocess((val) => (val === "" || val === null || isNaN(Number(val)) ? undefined : Number(val)), z.number().int().min(1900)),
    price: z.preprocess((val) => (val === "" || val === null || isNaN(Number(val)) ? undefined : Number(val)), z.number().positive()),
    mileage: z.preprocess((val) => (val === "" || val === null || isNaN(Number(val)) ? null : Number(val)), z.number().int().nonnegative().nullable().optional()),
    fuel_type: z.enum(['diesel', 'petrol', 'hybrid', 'electric', 'lpg']).nullable().optional(),
    transmission: z.enum(['automatic', 'manual']).nullable().optional(),
    engine_cc: z.preprocess((val) => (val === "" || val === null || isNaN(Number(val)) ? null : Number(val)), z.number().int().positive().nullable().optional()),
    color_exterior: z.string().nullable().optional(),
    color_interior: z.string().nullable().optional(),
    body_type: z.string().nullable().optional(),
    drive: z.enum(['4x4', 'fwd', 'rwd']).nullable().optional(),
    seats: z.number().int().positive().nullable().optional(),
    is_featured: z.boolean().default(false),
    is_available: z.boolean().default(true),
    description: z.record(z.string(), z.string()).nullable().optional(),
    features: z.record(z.string(), z.array(z.string())).nullable().optional(),
    car_images: z.array(z.object({
        url: z.string(),
        is_primary: z.boolean(),
    })).optional(),
    created_at: z.string().optional(),
});

export type Car = z.infer<typeof CarSchema>;

// Review Schema
export const ReviewSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
    content_ro: z.string().nullable(),
    content_ru: z.string().nullable(),
    content_en: z.string().nullable(),
    rating: z.number().int().min(1).max(5),
    avatar_url: z.string().nullable(),
    is_visible: z.boolean().default(true),
    created_at: z.string().optional(),
});

export type Review = z.infer<typeof ReviewSchema>;

// Partner Schema
export const PartnerSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().nullable(),
    logo_url: z.string().nullable(),
    website_url: z.string().nullable(),
    sort_order: z.number().int().default(0),
    is_visible: z.boolean().default(true),
});

export type Partner = z.infer<typeof PartnerSchema>;
