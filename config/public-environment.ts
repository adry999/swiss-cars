import { z } from 'zod';

const blankAsMissing = (value: unknown) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value;

const PublicEnvironmentSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(1),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.preprocess(blankAsMissing, z.string().trim().optional()),
});

export interface PublicEnvironment {
    supabase: { url: string; anonKey: string };
    googleAnalyticsMeasurementId: string | null;
}

export function parsePublicEnvironment(source: Record<string, string | undefined>): PublicEnvironment {
    const parsed = PublicEnvironmentSchema.safeParse(source);
    if (!parsed.success) {
        const invalidVariables = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))];
        throw new Error(`Invalid public environment variables: ${invalidVariables.join(', ')}`);
    }

    return Object.freeze({
        supabase: { url: parsed.data.NEXT_PUBLIC_SUPABASE_URL, anonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        googleAnalyticsMeasurementId: parsed.data.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null,
    });
}

let cachedPublicEnvironment: PublicEnvironment | undefined;

export function getPublicEnvironment(): PublicEnvironment {
    // Each variable is written out in full: Next inlines NEXT_PUBLIC_* into browser bundles only for
    // literal `process.env.NAME` expressions, never for `process.env` passed around as an object.
    cachedPublicEnvironment ??= parsePublicEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA_ID,
    });
    return cachedPublicEnvironment;
}
