'use server';

import { headers } from 'next/headers';
import { readClientIp } from '@core/http/client-ip';
import type { LeadInquiryDraft, LeadSubmissionResult } from '@features/leads';
import { getSubmitLeadInquiry } from './lead-inquiry-submission';

export async function submitLeadInquiryAction(draft: LeadInquiryDraft): Promise<LeadSubmissionResult> {
    return getSubmitLeadInquiry()(draft, { clientIp: readClientIp(await headers()) });
}
