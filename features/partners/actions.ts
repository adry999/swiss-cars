'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAuth } from '@/lib/utils/requireAuth';
import { PartnerSchema } from './partners.schema';
import type { PartnerRemovalResult, PartnerSaveResult } from './partners.types';
import { deletePartnerRecord, savePartnerRecord } from './server/partners-repository';

const PartnerIdSchema = z.uuid();

function revalidatePartners() {
    revalidatePath('/', 'layout');
    revalidatePath('/admin/partners');
}

export async function savePartner(partnerData: unknown): Promise<PartnerSaveResult> {
    await requireAuth();

    const parsed = PartnerSchema.safeParse(partnerData);
    if (!parsed.success) {
        return {
            status: 'rejected',
            reason: 'invalid-input',
            invalidFields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? 'partner')))],
        };
    }

    try {
        await savePartnerRecord(parsed.data);
    } catch (error) {
        console.error('Save partner failed:', error);
        return { status: 'rejected', reason: 'unavailable' };
    }

    revalidatePartners();
    return { status: 'succeeded' };
}

export async function deletePartner(partnerId: string): Promise<PartnerRemovalResult> {
    await requireAuth();
    if (!PartnerIdSchema.safeParse(partnerId).success) {
        return { status: 'rejected', reason: 'invalid-input' };
    }

    try {
        await deletePartnerRecord(partnerId);
    } catch (error) {
        console.error('Delete partner failed:', error);
        return { status: 'rejected', reason: 'unavailable' };
    }

    revalidatePartners();
    return { status: 'succeeded' };
}
