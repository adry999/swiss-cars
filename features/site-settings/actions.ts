'use server';

import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { requireAdmin } from '@shared/session/require-admin';
import { HomepageContentSchema, SiteConfigSchema } from './site-settings.schema';
import type { SiteSettingsSaveResult } from './site-settings.types';
import { writeSettingRow, type SettingKey } from './server/site-settings-repository';

export async function saveSiteConfig(settings: unknown): Promise<SiteSettingsSaveResult> {
    await requireAdmin();
    return validateAndWrite('site_config', SiteConfigSchema, settings, '/admin/settings');
}

export async function saveHomepageContent(content: unknown): Promise<SiteSettingsSaveResult> {
    await requireAdmin();
    return validateAndWrite('homepage_content', HomepageContentSchema, content, '/admin/homepage');
}

async function validateAndWrite(
    key: SettingKey,
    schema: z.ZodType<Record<string, unknown>>,
    value: unknown,
    adminPath: string,
): Promise<SiteSettingsSaveResult> {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
        return {
            status: 'rejected',
            reason: 'invalid-input',
            invalidFields: [...new Set(parsed.error.issues.map((issue) => issue.path.join('.') || key))],
        };
    }

    try {
        await writeSettingRow(key, parsed.data);
    } catch (error) {
        console.error(`Save ${key} failed:`, error);
        return { status: 'rejected', reason: 'unavailable' };
    }

    revalidatePath('/', 'layout');
    revalidatePath(adminPath);
    return { status: 'succeeded' };
}
