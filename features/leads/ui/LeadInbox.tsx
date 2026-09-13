'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCheck, Eye, EyeOff, Star, StarOff, Trash2, Phone, Mail, Car, CalendarCheck } from 'lucide-react';
import { useOptionalToast } from '@/components/ui/Toast';
import type { Lead, LeadInboxActions } from '../leads.types';
import { useLeadInbox } from './use-lead-inbox';
import styles from './LeadInbox.module.css';

type Props = {
    initialLeads: Lead[];
    inboxActions: LeadInboxActions;
};

export default function LeadInbox({ initialLeads, inboxActions }: Props) {
    const toast = useOptionalToast();
    const { leads, isPending, setReadState, setImportance, removeLead, markAllRead } = useLeadInbox(
        initialLeads,
        inboxActions,
        () => toast?.error('The change could not be saved. Refresh the page and try again.'),
    );
    const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const currentUnread = leads.filter(lead => !lead.is_read).length;

    const filtered = leads.filter(lead => {
        if (filter === 'unread') return !lead.is_read;
        if (filter === 'important') return lead.is_important;
        return true;
    });

    const toggleReadState = (id: string, is_read: boolean) => setReadState(id, is_read);

    const toggleImportance = (id: string, is_important: boolean) => setImportance(id, is_important);

    const confirmAndRemoveLead = (id: string) => {
        if (confirmDelete !== id) {
            setConfirmDelete(id);
            setTimeout(() => setConfirmDelete(null), 3000);
            return;
        }
        setConfirmDelete(null);
        removeLead(id);
    };

    const markEveryLeadRead = () => markAllRead();

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Leads</h1>
                    <p className={styles.subtitle}>
                        <code>{leads.length}</code> total · <code style={{ color: currentUnread > 0 ? 'var(--color-primary)' : '#059669' }}>{currentUnread} unread</code>
                    </p>
                </div>
                <div className={styles.headerActions}>
                    {currentUnread > 0 && (
                        <button
                            className={styles.markAllBtn}
                            onClick={markEveryLeadRead}
                            disabled={isPending}
                        >
                            <CheckCheck size={15} />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All<code style={{ marginLeft: '4px' }}>({leads.length})</code>
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'unread' ? styles.filterActive : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    <span className={styles.dot} />
                    Unread<code style={{ marginLeft: '4px' }}>({currentUnread})</code>
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'important' ? styles.filterActive : ''}`}
                    onClick={() => setFilter('important')}
                >
                    <Star size={12} />
                    Flagged<code style={{ marginLeft: '4px' }}>({leads.filter(lead => lead.is_important).length})</code>
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className={styles.empty}>
                    No leads {filter !== 'all' ? `in ${filter}` : 'yet'}.
                </div>
            ) : (
                <div className={styles.list}>
                    {filtered.map((lead) => (
                        <div
                            key={lead.id}
                            className={`${styles.card} ${!lead.is_read ? styles.cardUnread : ''} ${lead.is_important ? styles.cardImportant : ''}`}
                        >
                            <div className={styles.indicators}>
                                {!lead.is_read && <span className={styles.unreadDot} title="Necitit" />}
                                {lead.is_important && <Star size={12} className={styles.importantStar} />}
                            </div>

                            <div className={styles.content}>
                                <div className={styles.row1}>
                                    <div className={styles.nameBlock}>
                                        <span className={styles.name}>{lead.name}</span>
                                        <span className={lead.is_read ? 'badge-success' : 'badge badge-error'}>
                                            {lead.is_read ? 'Read' : 'New'}
                                        </span>
                                        {lead.form_type === 'testdrive' && (
                                            <span className="badge-info">Test Drive</span>
                                        )}
                                        {lead.is_important && (
                                            <span className="badge-warning">Flagged</span>
                                        )}
                                    </div>
                                    <span className={styles.date}>
                                        {lead.created_at ? format(new Date(lead.created_at), 'dd.MM.yyyy HH:mm') : '—'}
                                    </span>
                                </div>

                                <div className={styles.row2}>
                                    {lead.car_name && (
                                        lead.source_url ? (
                                            <a href={lead.source_url} target="_blank" rel="noopener noreferrer" className={styles.meta} style={{ textDecoration: 'underline' }}>
                                                <Car size={13} />
                                                {lead.car_name}
                                            </a>
                                        ) : (
                                            <span className={styles.meta}>
                                                <Car size={13} />
                                                {lead.car_name}
                                            </span>
                                        )
                                    )}
                                    <a href={`tel:${lead.phone}`} className={styles.meta}>
                                        <Phone size={13} />
                                        {lead.phone}
                                    </a>
                                    {lead.email && (
                                        <a href={`mailto:${lead.email}`} className={styles.meta}>
                                            <Mail size={13} />
                                            {lead.email}
                                        </a>
                                    )}
                                </div>

                                {lead.preferred_date && (
                                    <div className={styles.preferredDateRow}>
                                        <CalendarCheck size={12} />
                                        <span>Preferred: <strong>{lead.preferred_date}</strong></span>
                                    </div>
                                )}
                                {lead.message && (
                                    <p className={styles.message}>&ldquo;{lead.message}&rdquo;</p>
                                )}
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className="action-btn"
                                    onClick={() => toggleReadState(lead.id, !lead.is_read)}
                                    title={lead.is_read ? 'Mark unread' : 'Mark read'}
                                >
                                    {lead.is_read ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button
                                    className={lead.is_important ? 'action-btn action-btn-warning' : 'action-btn'}
                                    onClick={() => toggleImportance(lead.id, !lead.is_important)}
                                    title={lead.is_important ? 'Unflag' : 'Flag'}
                                >
                                    {lead.is_important ? <StarOff size={14} /> : <Star size={14} />}
                                </button>
                                <button
                                    className={confirmDelete === lead.id ? 'action-btn action-btn-delete' : 'action-btn action-btn-delete'}
                                    onClick={() => confirmAndRemoveLead(lead.id)}
                                    title={confirmDelete === lead.id ? 'Click again to confirm' : 'Delete'}
                                >
                                    <Trash2 size={14} />
                                    {confirmDelete === lead.id && <span style={{ fontSize: '10px', fontWeight: 700 }}>Confirm</span>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
