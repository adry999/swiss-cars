// @vitest-environment node
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isSupportedLocale, localeMessagesFilePath } from './locale-messages-file';

describe('isSupportedLocale', () => {
    it.each(['ro', 'ru', 'en'])('accepts the site locale %s', (locale) => {
        expect(isSupportedLocale(locale)).toBe(true);
    });

    it.each(['de', '', '../ro', 'ro.json', 'RO'])('rejects %j', (locale) => {
        expect(isSupportedLocale(locale)).toBe(false);
    });
});

describe('localeMessagesFilePath', () => {
    it('points at the locale file inside messages/', () => {
        expect(localeMessagesFilePath('ru')).toBe(path.join(process.cwd(), 'messages', 'ru.json'));
    });
});
