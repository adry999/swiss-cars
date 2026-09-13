import type { z } from 'zod';
import type { EventPublisher } from '@core/events/event-bus';
import type { RateLimiter, RateLimitPolicy } from '@core/rate-limit/rate-limiter';
import type { DomainEvents } from '@shared/contracts/domain-events';
import { LeadInquiryDraftSchema } from '../leads.schema';
import type { LeadsRepository, LeadSubmissionResult, StoredLeadInquiry, ValidLeadInquiry } from '../leads.types';

export const LEAD_SUBMISSION_RATE_LIMIT: RateLimitPolicy = { limit: 5, windowMs: 60_000 };

export interface SubmitLeadInquiryDependencies {
    leadsRepository: Pick<LeadsRepository, 'insertInquiry'>;
    rateLimiter: RateLimiter;
    eventPublisher: EventPublisher<DomainEvents>;
    now?: () => Date;
}

export interface LeadInquiryRequester {
    clientIp: string;
}

export type SubmitLeadInquiry = (
    untrustedDraft: unknown,
    requester: LeadInquiryRequester,
) => Promise<LeadSubmissionResult>;

function resolveSubject(inquiry: ValidLeadInquiry): string {
    if (inquiry.formType === 'testdrive') return 'Programare Vizionare';
    return inquiry.carTitle ?? 'Contact General';
}

function toStoredInquiry(inquiry: ValidLeadInquiry): StoredLeadInquiry {
    return {
        formType: inquiry.formType,
        carId: inquiry.carId ?? null,
        subject: resolveSubject(inquiry),
        customerName: inquiry.customerName,
        customerPhone: inquiry.customerPhone,
        customerEmail: inquiry.customerEmail ?? null,
        message: inquiry.message ?? null,
        preferredDate: inquiry.preferredDate ?? null,
        sourceUrl: inquiry.sourceUrl ?? null,
    };
}

function listInvalidFields(issues: z.core.$ZodIssue[]): string[] {
    return [...new Set(issues.map((issue) => String(issue.path[0] ?? 'draft')))];
}

export function createSubmitLeadInquiry({
    leadsRepository,
    rateLimiter,
    eventPublisher,
    now = () => new Date(),
}: SubmitLeadInquiryDependencies): SubmitLeadInquiry {
    return async function submitLeadInquiry(untrustedDraft, requester) {
        // Throttled before validation, so malformed requests also count against the client.
        const rateLimit = await rateLimiter.consume(`lead:${requester.clientIp}`, LEAD_SUBMISSION_RATE_LIMIT);
        if (!rateLimit.allowed) {
            return { status: 'rejected', reason: 'rate-limited' };
        }

        const parsedDraft = LeadInquiryDraftSchema.safeParse(untrustedDraft);
        if (!parsedDraft.success) {
            return { status: 'rejected', reason: 'invalid-input', invalidFields: listInvalidFields(parsedDraft.error.issues) };
        }

        const inquiry = toStoredInquiry(parsedDraft.data);
        let leadId: string;
        try {
            leadId = await leadsRepository.insertInquiry(inquiry);
        } catch (error) {
            console.error('Lead inquiry could not be stored:', error);
            return { status: 'rejected', reason: 'unavailable' };
        }

        await eventPublisher.publish('leads.inquiry-submitted', {
            leadId,
            ...inquiry,
            submittedAt: now().toISOString(),
        });

        return { status: 'succeeded' };
    };
}
