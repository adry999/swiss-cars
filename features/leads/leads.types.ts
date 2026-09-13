import type { z } from 'zod';
import type { ActionResult } from '@shared/contracts/action-result';
import type { LeadFormType } from '@shared/contracts/domain-events';
import type { LeadInquiryDraftSchema } from './leads.schema';

export type LeadInquiryDraft = z.input<typeof LeadInquiryDraftSchema>;
export type ValidLeadInquiry = z.output<typeof LeadInquiryDraftSchema>;

export type LeadSubmissionRejection = 'rate-limited' | 'invalid-input' | 'unavailable';
export type LeadSubmissionResult = ActionResult<LeadSubmissionRejection>;
export type LeadInboxChangeResult = ActionResult<'invalid-input' | 'unavailable'>;

export interface StoredLeadInquiry {
    formType: LeadFormType;
    carId: string | null;
    subject: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    message: string | null;
    preferredDate: string | null;
    sourceUrl: string | null;
}

/** A `leads_inquiries` row as the admin inbox reads it. */
export interface Lead {
    id: string;
    car_id: string | null;
    car_name: string | null;
    name: string;
    phone: string;
    email: string | null;
    message: string | null;
    preferred_date: string | null;
    form_type: string | null;
    source_url: string | null;
    is_read: boolean;
    is_important: boolean;
    created_at: string;
}

export interface LeadInboxPage {
    leads: Lead[];
    totalCount: number;
    totalPages: number;
}

export interface LeadsRepository {
    insertInquiry(inquiry: StoredLeadInquiry): Promise<string>;
    readInboxPage(page: number, pageSize: number): Promise<LeadInboxPage>;
    setRead(leadId: string, isRead: boolean): Promise<void>;
    setImportant(leadId: string, isImportant: boolean): Promise<void>;
    markAllRead(): Promise<void>;
    remove(leadId: string): Promise<void>;
}

/** Server Actions the admin inbox calls; each mutation resolves rather than throwing on a server-side refusal. */
export interface LeadInboxActions {
    markLeadRead(leadId: string, isRead: boolean): Promise<LeadInboxChangeResult>;
    markLeadImportant(leadId: string, isImportant: boolean): Promise<LeadInboxChangeResult>;
    deleteLead(leadId: string): Promise<LeadInboxChangeResult>;
    markAllLeadsRead(): Promise<LeadInboxChangeResult>;
}
