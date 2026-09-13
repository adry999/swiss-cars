import 'server-only';
import path from 'node:path';
import { routing } from '@i18n/routing';

export type SupportedLocale = (typeof routing.locales)[number];

/** Also the path-traversal guard: only a known locale ever becomes part of a file path. */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
    return (routing.locales as readonly string[]).includes(locale);
}

export function localeMessagesFilePath(locale: SupportedLocale): string {
    return path.join(process.cwd(), 'messages', `${locale}.json`);
}
