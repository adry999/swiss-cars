import { z } from 'zod';

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
