import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { LeadSubmissionResult } from '../leads.types';
import { carInquiryDraft } from '../test-support/lead-inquiry-drafts';
import {
    leadInquiryFailureMessageKey,
    useLeadInquirySubmission,
    type LeadInquiryAction,
} from './use-lead-inquiry-submission';

function deferredResult() {
    let resolve!: (result: LeadSubmissionResult) => void;
    const promise = new Promise<LeadSubmissionResult>((settle) => {
        resolve = settle;
    });
    return { promise, resolve };
}

describe('useLeadInquirySubmission', () => {
    it('starts idle', () => {
        const { result } = renderHook(() => useLeadInquirySubmission(vi.fn()));

        expect(result.current.state).toEqual({ status: 'idle' });
    });

    it('is submitting while the server works, then succeeds when the lead is accepted', async () => {
        const pending = deferredResult();
        const submitLeadInquiry = vi.fn<LeadInquiryAction>(() => pending.promise);
        const { result } = renderHook(() => useLeadInquirySubmission(submitLeadInquiry));

        let submission!: Promise<void>;
        act(() => {
            submission = result.current.submit(carInquiryDraft);
        });
        expect(result.current.state).toEqual({ status: 'submitting' });

        await act(async () => {
            pending.resolve({ status: 'succeeded' });
            await submission;
        });

        expect(submitLeadInquiry).toHaveBeenCalledWith(carInquiryDraft);
        expect(result.current.state).toEqual({ status: 'succeeded' });
    });

    it('fails with the server rejection reason', async () => {
        const submitLeadInquiry = vi.fn<LeadInquiryAction>(async () => ({ status: 'rejected', reason: 'rate-limited' }));
        const { result } = renderHook(() => useLeadInquirySubmission(submitLeadInquiry));

        await act(() => result.current.submit(carInquiryDraft));

        expect(result.current.state).toEqual({
            status: 'failed',
            failure: { kind: 'rejected', reason: 'rate-limited' },
        });
    });

    it('fails as unreachable when the request itself breaks', async () => {
        const submitLeadInquiry = vi.fn<LeadInquiryAction>(async () => {
            throw new TypeError('Failed to fetch');
        });
        const { result } = renderHook(() => useLeadInquirySubmission(submitLeadInquiry));

        await act(() => result.current.submit(carInquiryDraft));

        expect(result.current.state).toEqual({ status: 'failed', failure: { kind: 'unreachable' } });
    });

    it('ignores a second submit while the first is still in flight', async () => {
        const pending = deferredResult();
        const submitLeadInquiry = vi.fn<LeadInquiryAction>(() => pending.promise);
        const { result } = renderHook(() => useLeadInquirySubmission(submitLeadInquiry));

        let firstSubmission!: Promise<void>;
        act(() => {
            firstSubmission = result.current.submit(carInquiryDraft);
            void result.current.submit(carInquiryDraft);
        });
        await act(async () => {
            pending.resolve({ status: 'succeeded' });
            await firstSubmission;
        });

        expect(submitLeadInquiry).toHaveBeenCalledOnce();
    });

    it('accepts a new submit after a failed one', async () => {
        const submitLeadInquiry = vi
            .fn<LeadInquiryAction>()
            .mockResolvedValueOnce({ status: 'rejected', reason: 'unavailable' })
            .mockResolvedValueOnce({ status: 'succeeded' });
        const { result } = renderHook(() => useLeadInquirySubmission(submitLeadInquiry));

        await act(() => result.current.submit(carInquiryDraft));
        await act(() => result.current.submit(carInquiryDraft));

        expect(result.current.state).toEqual({ status: 'succeeded' });
    });

    it('returns to idle when reset, so the customer can send another request', async () => {
        const submitLeadInquiry = vi.fn<LeadInquiryAction>(async () => ({ status: 'succeeded' }));
        const { result } = renderHook(() => useLeadInquirySubmission(submitLeadInquiry));

        await act(() => result.current.submit(carInquiryDraft));
        act(() => result.current.reset());

        expect(result.current.state).toEqual({ status: 'idle' });
    });
});

describe('leadInquiryFailureMessageKey', () => {
    it.each([
        [{ kind: 'rejected', reason: 'rate-limited' } as const, 'rate_limited'],
        [{ kind: 'rejected', reason: 'invalid-input' } as const, 'invalid_input'],
        [{ kind: 'rejected', reason: 'unavailable' } as const, 'submit_error'],
        [{ kind: 'unreachable' } as const, 'submit_error'],
    ])('maps %o to errors.%s', (failure, messageKey) => {
        expect(leadInquiryFailureMessageKey(failure)).toBe(messageKey);
    });
});
