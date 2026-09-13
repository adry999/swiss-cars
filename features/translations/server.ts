import 'server-only';
import { promises as fs } from 'node:fs';
import { requireAdmin } from '@shared/session/require-admin';
import { isSupportedLocale, localeMessagesFilePath } from './server/locale-messages-file';
import type { MessagesTree } from './translations.types';

export async function readLocaleMessages(locale: string): Promise<MessagesTree | null> {
    await requireAdmin();
    if (!isSupportedLocale(locale)) return null;

    try {
        return JSON.parse(await fs.readFile(localeMessagesFilePath(locale), 'utf8'));
    } catch (error) {
        console.error(`Could not read messages for locale "${locale}":`, error);
        return null;
    }
}
