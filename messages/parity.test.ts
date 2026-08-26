import { describe, it, expect } from 'vitest';
import ro from './ro.json';
import ru from './ru.json';
import en from './en.json';

/**
 * Romanian is the reference locale. A key present in ro.json but missing
 * elsewhere renders as the raw key path in production — ru.json was missing
 * the whole `cars.*` block, so the Russian inventory page showed "cars.title".
 */
type Json = { [key: string]: unknown };

function flatten(obj: Json, prefix = ''): string[] {
    return Object.entries(obj).flatMap(([key, value]) =>
        value && typeof value === 'object' && !Array.isArray(value)
            ? flatten(value as Json, `${prefix}${key}.`)
            : [`${prefix}${key}`]
    );
}

const reference = flatten(ro as Json).sort();
const locales: Record<string, Json> = { ru: ru as Json, en: en as Json };

describe('translation key parity', () => {
    for (const [name, messages] of Object.entries(locales)) {
        const keys = flatten(messages).sort();

        it(`${name}.json has no keys missing from ro.json`, () => {
            expect(reference.filter((key) => !keys.includes(key))).toEqual([]);
        });

        it(`${name}.json has no keys absent from ro.json`, () => {
            expect(keys.filter((key) => !reference.includes(key))).toEqual([]);
        });
    }

    it('every locale has the same key count', () => {
        expect(flatten(ru as Json)).toHaveLength(reference.length);
        expect(flatten(en as Json)).toHaveLength(reference.length);
    });
});
