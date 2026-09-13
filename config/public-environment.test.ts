// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parsePublicEnvironment } from './public-environment';

const SUPABASE_VARIABLES = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://xlrkuaxnkidslrhdelpm.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
};

describe('parsePublicEnvironment', () => {
    it('exposes the Supabase project credentials', () => {
        expect(parsePublicEnvironment(SUPABASE_VARIABLES)).toEqual({
            supabase: { url: 'https://xlrkuaxnkidslrhdelpm.supabase.co', anonKey: 'anon-key' },
            googleAnalyticsMeasurementId: null,
        });
    });

    it('exposes the analytics measurement id when set', () => {
        const environment = parsePublicEnvironment({ ...SUPABASE_VARIABLES, NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-ABC123' });

        expect(environment.googleAnalyticsMeasurementId).toBe('G-ABC123');
    });

    it('rejects the .env.example placeholders instead of querying a fake project', () => {
        expect(() =>
            parsePublicEnvironment({
                NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_project_url',
                NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
            }),
        ).toThrow('Invalid public environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
    });

    it('returns a frozen object', () => {
        expect(Object.isFrozen(parsePublicEnvironment(SUPABASE_VARIABLES))).toBe(true);
    });
});
