'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAuth } from '@/lib/utils/requireAuth';
import type { LeadInboxChangeResult } from './leads.types';
import { supabaseLeadsRepository } from './server/supabase-leads-repository';

const LeadIdSchema = z.uuid();

const invalidInput: LeadInboxChangeResult = { status: 'rejected', reason: 'invalid-input' };

async function changeInbox(change: () => Promise<void>): Promise<LeadInboxChangeResult> {
    try {
        await change();
    } catch (error) {
        console.error('Lead inbox change failed:', error);
        return { status: 'rejected', reason: 'unavailable' };
    }

    revalidatePath('/admin/leads');
    return { status: 'succeeded' };
}

export async function markLeadRead(leadId: string, isRead: boolean): Promise<LeadInboxChangeResult> {
    await requireAuth();
    if (!LeadIdSchema.safeParse(leadId).success || typeof isRead !== 'boolean') return invalidInput;

    return changeInbox(() => supabaseLeadsRepository.setRead(leadId, isRead));
}

export async function markLeadImportant(leadId: string, isImportant: boolean): Promise<LeadInboxChangeResult> {
    await requireAuth();
    if (!LeadIdSchema.safeParse(leadId).success || typeof isImportant !== 'boolean') return invalidInput;

    return changeInbox(() => supabaseLeadsRepository.setImportant(leadId, isImportant));
}

export async function deleteLead(leadId: string): Promise<LeadInboxChangeResult> {
    await requireAuth();
    if (!LeadIdSchema.safeParse(leadId).success) return invalidInput;

    return changeInbox(() => supabaseLeadsRepository.remove(leadId));
}

export async function markAllLeadsRead(): Promise<LeadInboxChangeResult> {
    await requireAuth();

    return changeInbox(() => supabaseLeadsRepository.markAllRead());
}
