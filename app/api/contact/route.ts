import { NextRequest, NextResponse } from 'next/server';
import { readClientIp } from '@core/http/client-ip';
import type { LeadSubmissionRejection } from '@features/leads';
import { getSubmitLeadInquiry } from '@app/_composition/lead-inquiry-submission';

const RESPONSE_BY_REJECTION: Record<LeadSubmissionRejection, { status: number; error: string }> = {
    'rate-limited': { status: 429, error: 'Too many requests. Please try again later.' },
    'invalid-input': { status: 400, error: 'Invalid contact request.' },
    unavailable: { status: 500, error: 'Could not save your request. Please try again.' },
};

// Public request body, kept stable for existing callers: { name, phone, email, message, preferredDate, formType, sourceUrl }.
function toLeadInquiryDraft(body: unknown): unknown {
    if (typeof body !== 'object' || body === null) return body;

    const contactRequest = body as Record<string, unknown>;
    return {
        formType: contactRequest.formType ?? 'contact',
        customerName: contactRequest.name,
        customerPhone: contactRequest.phone,
        customerEmail: contactRequest.email,
        message: contactRequest.message,
        preferredDate: contactRequest.preferredDate,
        sourceUrl: contactRequest.sourceUrl,
    };
}

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Request body must be JSON.' }, { status: 400 });
    }

    const result = await getSubmitLeadInquiry()(toLeadInquiryDraft(body), {
        clientIp: readClientIp(request.headers),
    });

    if (result.status === 'succeeded') {
        return NextResponse.json({ success: true });
    }

    const { status, error } = RESPONSE_BY_REJECTION[result.reason];
    return NextResponse.json({ error, invalidFields: result.invalidFields }, { status });
}
