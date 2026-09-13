'use client';

import { useCallback, useRef, useState } from 'react';
import type { LeadInquiryDraft, LeadSubmissionRejection, LeadSubmissionResult } from '../leads.types';

export type LeadInquiryAction = (draft: LeadInquiryDraft) => Promise<LeadSubmissionResult>;

export type LeadInquiryFailure =
    | { kind: 'rejected'; reason: LeadSubmissionRejection }
    | { kind: 'unreachable' };

export type LeadInquirySubmissionState =
    | { status: 'idle' }
    | { status: 'submitting' }
    | { status: 'succeeded' }
    | { status: 'failed'; failure: LeadInquiryFailure };

/** Keys of the `errors` message namespace. */
export type LeadInquiryFailureMessageKey = 'rate_limited' | 'invalid_input' | 'submit_error';

export function leadInquiryFailureMessageKey(failure: LeadInquiryFailure): LeadInquiryFailureMessageKey {
    if (failure.kind === 'unreachable') return 'submit_error';

    switch (failure.reason) {
        case 'rate-limited':
            return 'rate_limited';
        case 'invalid-input':
            return 'invalid_input';
        case 'unavailable':
            return 'submit_error';
    }
}

export function useLeadInquirySubmission(submitLeadInquiry: LeadInquiryAction) {
    const [state, setState] = useState<LeadInquirySubmissionState>({ status: 'idle' });
    // A ref rather than state: a second click can land before React re-renders the disabled button.
    const submissionInFlight = useRef(false);

    const submit = useCallback(
        async (draft: LeadInquiryDraft) => {
            if (submissionInFlight.current) return;
            submissionInFlight.current = true;
            setState({ status: 'submitting' });

            try {
                const result = await submitLeadInquiry(draft);
                setState(
                    result.status === 'succeeded'
                        ? { status: 'succeeded' }
                        : { status: 'failed', failure: { kind: 'rejected', reason: result.reason } },
                );
            } catch {
                // The request may or may not have been stored; the message invites a retry or a phone call.
                setState({ status: 'failed', failure: { kind: 'unreachable' } });
            } finally {
                submissionInFlight.current = false;
            }
        },
        [submitLeadInquiry],
    );

    const reset = useCallback(() => setState({ status: 'idle' }), []);

    return { state, submit, reset };
}
