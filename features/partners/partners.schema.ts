import { z } from 'zod';

export const PartnerSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().nullable(),
    logo_url: z.string().nullable(),
    website_url: z.string().nullable(),
    sort_order: z.number().int().default(0),
    is_visible: z.boolean().default(true),
});
