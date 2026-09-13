import type { LeadInquirySubmitted } from '@shared/contracts/domain-events';

export function buildLeadInquirySubmitted(overrides: Partial<LeadInquirySubmitted> = {}): LeadInquirySubmitted {
    return {
        leadId: '7b1e9c52-0f4a-4d38-9e2b-5c6a1f8d3e40',
        formType: 'inquiry',
        carId: '5d0f7a8e-3c1b-4b8e-9a51-2f7c1d9e4b20',
        subject: 'BMW X5 2020',
        customerName: 'Ion Popescu',
        customerPhone: '+373 69 123 456',
        customerEmail: 'ion@example.md',
        message: 'Mai este disponibilă?',
        preferredDate: null,
        sourceUrl: 'https://swisscars.md/inventory/bmw-x5-2020',
        submittedAt: '2026-09-13T09:30:00.000Z',
        ...overrides,
    };
}
