import { z } from 'zod';

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
