import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Lead, LeadInboxActions, LeadInboxChangeResult } from '../leads.types';
import { useLeadInbox } from './use-lead-inbox';

function lead(overrides: Partial<Lead> & { id: string }): Lead {
    return {
        car_id: null,
        car_name: null,
        name: 'Ion Popescu',
        phone: '+37360000000',
        email: null,
        message: null,
        preferred_date: null,
        form_type: 'inquiry',
        source_url: null,
        is_read: false,
        is_important: false,
        created_at: '2026-09-01T00:00:00.000Z',
        ...overrides,
    };
}

function deferredResult() {
    let resolve!: (result: LeadInboxChangeResult) => void;
    const promise = new Promise<LeadInboxChangeResult>((settle) => {
        resolve = settle;
    });
    return { promise, resolve };
}

const succeeded: LeadInboxChangeResult = { status: 'succeeded' };

function fakeInboxActions(overrides: Partial<LeadInboxActions> = {}): LeadInboxActions {
    return {
        markLeadRead: vi.fn(async () => succeeded),
        markLeadImportant: vi.fn(async () => succeeded),
        deleteLead: vi.fn(async () => succeeded),
        markAllLeadsRead: vi.fn(async () => succeeded),
        ...overrides,
    };
}

describe('useLeadInbox', () => {
    it('shows the change immediately, before the server answers', () => {
        const pending = deferredResult();
        const inboxActions = fakeInboxActions({ markLeadRead: vi.fn(() => pending.promise) });
        const { result } = renderHook(() => useLeadInbox([lead({ id: 'a', is_read: false })], inboxActions, vi.fn()));

        act(() => result.current.setReadState('a', true));

        expect(result.current.leads[0].is_read).toBe(true);
    });

    it('rolls back a read-state change the server rejects and reports it', async () => {
        const onChangeRejected = vi.fn();
        const inboxActions = fakeInboxActions({
            markLeadRead: vi.fn(async (): Promise<LeadInboxChangeResult> => ({ status: 'rejected', reason: 'unavailable' })),
        });
        const { result } = renderHook(() => useLeadInbox([lead({ id: 'a', is_read: false })], inboxActions, onChangeRejected));

        await act(async () => {
            result.current.setReadState('a', true);
        });

        expect(result.current.leads[0].is_read).toBe(false);
        expect(onChangeRejected).toHaveBeenCalledOnce();
    });

    it('rolls back when the action throws', async () => {
        const onChangeRejected = vi.fn();
        const inboxActions = fakeInboxActions({
            markLeadImportant: vi.fn(async () => {
                throw new TypeError('Failed to fetch');
            }),
        });
        const { result } = renderHook(() => useLeadInbox([lead({ id: 'a', is_important: false })], inboxActions, onChangeRejected));

        await act(async () => {
            result.current.setImportance('a', true);
        });

        expect(result.current.leads[0].is_important).toBe(false);
        expect(onChangeRejected).toHaveBeenCalledOnce();
    });

    it('restores a deleted lead at its original position when deletion fails', async () => {
        const inboxActions = fakeInboxActions({
            deleteLead: vi.fn(async (): Promise<LeadInboxChangeResult> => ({ status: 'rejected', reason: 'unavailable' })),
        });
        const initialLeads = [lead({ id: 'a' }), lead({ id: 'b' }), lead({ id: 'c' })];
        const { result } = renderHook(() => useLeadInbox(initialLeads, inboxActions, vi.fn()));

        await act(async () => {
            result.current.removeLead('b');
        });

        expect(result.current.leads.map(l => l.id)).toEqual(['a', 'b', 'c']);
    });

    it('does not undo a successful change on another lead when one change is rejected', async () => {
        const readPending = deferredResult();
        const importantPending = deferredResult();
        const inboxActions = fakeInboxActions({
            markLeadRead: vi.fn(() => readPending.promise),
            markLeadImportant: vi.fn(() => importantPending.promise),
        });
        const initialLeads = [lead({ id: 'a', is_read: false }), lead({ id: 'b', is_important: false })];
        const { result } = renderHook(() => useLeadInbox(initialLeads, inboxActions, vi.fn()));

        act(() => {
            result.current.setReadState('a', true);
            result.current.setImportance('b', true);
        });

        await act(async () => {
            readPending.resolve({ status: 'rejected', reason: 'unavailable' });
            importantPending.resolve({ status: 'succeeded' });
        });

        const byId = Object.fromEntries(result.current.leads.map(l => [l.id, l]));
        expect(byId.a.is_read).toBe(false);
        expect(byId.b.is_important).toBe(true);
    });

    it('re-marks only the previously unread leads as unread when markAllRead fails', async () => {
        const inboxActions = fakeInboxActions({
            markAllLeadsRead: vi.fn(async (): Promise<LeadInboxChangeResult> => ({ status: 'rejected', reason: 'unavailable' })),
        });
        const initialLeads = [
            lead({ id: 'a', is_read: false }),
            lead({ id: 'b', is_read: true }),
            lead({ id: 'c', is_read: false }),
        ];
        const { result } = renderHook(() => useLeadInbox(initialLeads, inboxActions, vi.fn()));

        await act(async () => {
            result.current.markAllRead();
        });

        const byId = Object.fromEntries(result.current.leads.map(l => [l.id, l]));
        expect(byId.a.is_read).toBe(false);
        expect(byId.b.is_read).toBe(true);
        expect(byId.c.is_read).toBe(false);
    });
});
