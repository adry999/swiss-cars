// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EventPublisher } from '@core/events/event-bus';
import type { RateLimiter } from '@core/rate-limit/rate-limiter';
import type { DomainEvents } from '@shared/contracts/domain-events';
import type { StoredLeadInquiry } from '../leads.types';
import { carInquiryDraft, testDriveDraft } from '../test-support/lead-inquiry-drafts';
import { createSubmitLeadInquiry, LEAD_SUBMISSION_RATE_LIMIT } from './submit-lead-inquiry';

const REQUESTER = { clientIp: '203.0.113.7' };
const SUBMITTED_AT = new Date('2026-09-13T09:30:00.000Z');

function setUpSubmission({
    withinRateLimit = true,
    insertInquiry,
}: {
    withinRateLimit?: boolean;
    insertInquiry?: (inquiry: StoredLeadInquiry) => Promise<string>;
} = {}) {
    const storedInquiries: StoredLeadInquiry[] = [];
    const publishedEvents: Array<{ name: string; payload: unknown }> = [];

    const rateLimiter: RateLimiter = {
        consume: vi.fn(async () => ({ allowed: withinRateLimit, remaining: withinRateLimit ? 4 : 0, resetsAt: 0 })),
    };
    const eventPublisher: EventPublisher<DomainEvents> = {
        async publish(name, payload) {
            publishedEvents.push({ name, payload });
        },
    };

    const submitLeadInquiry = createSubmitLeadInquiry({
        leadsRepository: {
            insertInquiry:
                insertInquiry ??
                (async (inquiry) => {
                    storedInquiries.push(inquiry);
                    return 'lead-42';
                }),
        },
        rateLimiter,
        eventPublisher,
        now: () => SUBMITTED_AT,
    });

    return { submitLeadInquiry, rateLimiter, storedInquiries, publishedEvents };
}

describe('submitLeadInquiry', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('stores a car inquiry and announces it with the stored details', async () => {
        const { submitLeadInquiry, storedInquiries, publishedEvents } = setUpSubmission();

        const result = await submitLeadInquiry(carInquiryDraft, REQUESTER);

        expect(result).toEqual({ status: 'succeeded' });
        const expectedInquiry: StoredLeadInquiry = {
            formType: 'inquiry',
            carId: '5d0f7a8e-3c1b-4b8e-9a51-2f7c1d9e4b20',
            subject: 'BMW X5 2020',
            customerName: 'Ion Popescu',
            customerPhone: '+373 69 123 456',
            customerEmail: 'ion@example.md',
            message: 'Mai este disponibilă?',
            preferredDate: null,
            sourceUrl: 'https://swisscars.md/inventory/bmw-x5-2020',
        };
        expect(storedInquiries).toEqual([expectedInquiry]);
        expect(publishedEvents).toEqual([
            {
                name: 'leads.inquiry-submitted',
                payload: { leadId: 'lead-42', ...expectedInquiry, submittedAt: '2026-09-13T09:30:00.000Z' },
            },
        ]);
    });

    it('labels a test-drive request that is not about a specific car', async () => {
        const { submitLeadInquiry, storedInquiries } = setUpSubmission();

        await submitLeadInquiry(testDriveDraft, REQUESTER);

        expect(storedInquiries[0]).toMatchObject({
            formType: 'testdrive',
            carId: null,
            subject: 'Programare Vizionare',
            customerEmail: null,
            preferredDate: '2026-09-20',
        });
    });

    it('throttles per client IP and stores nothing once the limit is reached', async () => {
        const { submitLeadInquiry, rateLimiter, storedInquiries, publishedEvents } = setUpSubmission({
            withinRateLimit: false,
        });

        const result = await submitLeadInquiry(carInquiryDraft, REQUESTER);

        expect(result).toEqual({ status: 'rejected', reason: 'rate-limited' });
        expect(rateLimiter.consume).toHaveBeenCalledWith('lead:203.0.113.7', LEAD_SUBMISSION_RATE_LIMIT);
        expect(storedInquiries).toEqual([]);
        expect(publishedEvents).toEqual([]);
    });

    it('names the invalid fields and stores nothing', async () => {
        const { submitLeadInquiry, storedInquiries } = setUpSubmission();

        const result = await submitLeadInquiry(
            { ...carInquiryDraft, customerPhone: '12', customerEmail: 'not-an-email' },
            REQUESTER,
        );

        expect(result).toEqual({
            status: 'rejected',
            reason: 'invalid-input',
            invalidFields: ['customerPhone', 'customerEmail'],
        });
        expect(storedInquiries).toEqual([]);
    });

    it('rejects a car inquiry that does not reference a car', async () => {
        const { submitLeadInquiry } = setUpSubmission();

        const result = await submitLeadInquiry({ ...carInquiryDraft, carId: '' }, REQUESTER);

        expect(result).toEqual({ status: 'rejected', reason: 'invalid-input', invalidFields: ['carId'] });
    });

    it('rejects a source URL that is not http(s)', async () => {
        const { submitLeadInquiry } = setUpSubmission();

        const result = await submitLeadInquiry({ ...carInquiryDraft, sourceUrl: 'javascript:alert(1)' }, REQUESTER);

        expect(result).toEqual({ status: 'rejected', reason: 'invalid-input', invalidFields: ['sourceUrl'] });
    });

    it('rejects a payload that is not a draft at all', async () => {
        const { submitLeadInquiry } = setUpSubmission();

        const result = await submitLeadInquiry('DROP TABLE leads_inquiries', REQUESTER);

        expect(result).toEqual({ status: 'rejected', reason: 'invalid-input', invalidFields: ['draft'] });
    });

    it('reports the service as unavailable when the lead cannot be stored, and announces nothing', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { submitLeadInquiry, publishedEvents } = setUpSubmission({
            insertInquiry: async () => {
                throw new Error('connection refused');
            },
        });

        const result = await submitLeadInquiry(carInquiryDraft, REQUESTER);

        expect(result).toEqual({ status: 'rejected', reason: 'unavailable' });
        expect(publishedEvents).toEqual([]);
    });
});
