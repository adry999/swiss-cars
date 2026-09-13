'use client';

import { useState, useTransition } from 'react';
import type { Lead, LeadInboxActions, LeadInboxChangeResult } from '../leads.types';

function isRejected(result: LeadInboxChangeResult): boolean {
    return result.status === 'rejected';
}

export function useLeadInbox(initialLeads: Lead[], inboxActions: LeadInboxActions, onChangeRejected: () => void) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [isPending, startTransition] = useTransition();

    function runChange(apply: () => void, revert: () => void, send: () => Promise<LeadInboxChangeResult>) {
        apply();
        startTransition(async () => {
            try {
                const result = await send();
                if (isRejected(result)) {
                    revert();
                    onChangeRejected();
                }
            } catch {
                revert();
                onChangeRejected();
            }
        });
    }

    function setReadState(leadId: string, isRead: boolean) {
        const previous = leads.find(lead => lead.id === leadId)!.is_read;
        runChange(
            () => setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, is_read: isRead } : lead)),
            () => setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, is_read: previous } : lead)),
            () => inboxActions.markLeadRead(leadId, isRead),
        );
    }

    function setImportance(leadId: string, isImportant: boolean) {
        const previous = leads.find(lead => lead.id === leadId)!.is_important;
        runChange(
            () => setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, is_important: isImportant } : lead)),
            () => setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, is_important: previous } : lead)),
            () => inboxActions.markLeadImportant(leadId, isImportant),
        );
    }

    function removeLead(leadId: string) {
        const index = leads.findIndex(lead => lead.id === leadId);
        const removed = leads[index];
        runChange(
            () => setLeads(prev => prev.filter(lead => lead.id !== leadId)),
            () => setLeads(prev => {
                const restored = [...prev];
                restored.splice(index, 0, removed);
                return restored;
            }),
            () => inboxActions.deleteLead(leadId),
        );
    }

    function markAllRead() {
        const previouslyUnreadIds = new Set(leads.filter(lead => !lead.is_read).map(lead => lead.id));
        runChange(
            () => setLeads(prev => prev.map(lead => ({ ...lead, is_read: true }))),
            () => setLeads(prev => prev.map(lead => previouslyUnreadIds.has(lead.id) ? { ...lead, is_read: false } : lead)),
            () => inboxActions.markAllLeadsRead(),
        );
    }

    return { leads, isPending, setReadState, setImportance, removeLead, markAllRead };
}
