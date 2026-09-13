import { z } from 'zod';

// Zod schema for car translations
export const TranslatedFieldSchema = z.object({
    ro: z.string(),
    ru: z.string().optional(),
    en: z.string().optional(),
});

export type TranslatedField = z.infer<typeof TranslatedFieldSchema>;
