import { describe, expect, it } from 'vitest';
import { pickTranslation } from './pick-translation';

describe('pickTranslation', () => {
    it('returns the value for the requested locale', () => {
        expect(pickTranslation({ ro: 'Despre noi', ru: 'О нас', en: 'About us' }, 'en')).toBe('About us');
    });

    it('falls back to Romanian when the locale is missing or empty', () => {
        expect(pickTranslation({ ro: 'Despre noi', en: '' }, 'en')).toBe('Despre noi');
        expect(pickTranslation({ ro: 'Despre noi' }, 'ru')).toBe('Despre noi');
    });

    it('accepts a plain string stored by older homepage rows', () => {
        expect(pickTranslation('Servicii', 'en')).toBe('Servicii');
    });

    it('returns undefined when nothing usable is stored', () => {
        expect(pickTranslation(undefined, 'ro')).toBeUndefined();
        expect(pickTranslation(null, 'ro')).toBeUndefined();
        expect(pickTranslation({ ro: '', en: '' }, 'en')).toBeUndefined();
        expect(pickTranslation('', 'ro')).toBeUndefined();
    });
});
