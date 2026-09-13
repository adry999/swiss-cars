import type { LeadInquiryDraft } from '../leads.types';

export const carInquiryDraft: LeadInquiryDraft = {
    formType: 'inquiry',
    carId: '5d0f7a8e-3c1b-4b8e-9a51-2f7c1d9e4b20',
    carTitle: 'BMW X5 2020',
    customerName: 'Ion Popescu',
    customerPhone: '+373 69 123 456',
    customerEmail: 'ion@example.md',
    message: 'Mai este disponibilă?',
    sourceUrl: 'https://swisscars.md/inventory/bmw-x5-2020',
};

export const testDriveDraft: LeadInquiryDraft = {
    formType: 'testdrive',
    customerName: 'Maria Rusu',
    customerPhone: '069123456',
    customerEmail: '',
    preferredDate: '2026-09-20',
    sourceUrl: 'https://swisscars.md/contact',
};
