export const LEAD_FORM_TYPES = ['inquiry', 'contact', 'callback', 'testdrive'] as const;

export type LeadFormType = (typeof LEAD_FORM_TYPES)[number];

export interface LeadInquirySubmitted {
    leadId: string;
    formType: LeadFormType;
    carId: string | null;
    subject: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    message: string | null;
    preferredDate: string | null;
    sourceUrl: string | null;
    submittedAt: string;
}

export interface DomainEvents {
    'leads.inquiry-submitted': LeadInquirySubmitted;
}
