'use server';

import { promises as fs } from 'node:fs';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ActionResult } from '@shared/contracts/action-result';
import { requireAuth } from '@/lib/utils/requireAuth';
import { isSupportedLocale, localeMessagesFilePath } from './server/locale-messages-file';

const MessagesTreeSchema = z.record(z.string(), z.unknown());

export async function saveLocaleMessages(
    locale: string,
    messages: unknown,
): Promise<ActionResult<'invalid-locale' | 'invalid-input' | 'unavailable'>> {
    await requireAuth();

    if (!isSupportedLocale(locale)) {
        return { status: 'rejected', reason: 'invalid-locale' };
    }

    const parsedMessages = MessagesTreeSchema.safeParse(messages);
    if (!parsedMessages.success) {
        return { status: 'rejected', reason: 'invalid-input' };
    }

    try {
        await fs.writeFile(localeMessagesFilePath(locale), JSON.stringify(parsedMessages.data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Could not write messages for locale "${locale}":`, error);
        return { status: 'rejected', reason: 'unavailable' };
    }

    revalidatePath('/', 'layout');
    return { status: 'succeeded' };
}
