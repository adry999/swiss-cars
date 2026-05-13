'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { CheckCheck, Eye, EyeOff, Star, StarOff, Trash2, Phone, Mail, Car, Link as LinkIcon, CalendarCheck } from 'lucide-react';
import { markLeadRead, markLeadImportant, deleteLead, markAllLeadsRead } from '@/lib/actions/leads';
import styles from './LeadsTable.module.css';

type Lead = {
    id: string;
    car_name: string | null;
    name: string;
    phone: string;
    email: string | null;
    message: string | null;
    preferred_date: string | null;
    form_type: string | null;
    source_url: string | null;
    is_read: boolean;
    is_important: boolean;
    created_at: string;
};

type Props = {
    initialLeads: Lead[];
    unreadCount: number;
};

export default function LeadsTable({ initialLeads, unreadCount }: Props) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [isPending, startTransition] = useTransition();
    const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const currentUnread = leads.filter(l => !l.is_read).length;

    const filtered = leads.filter(l => {
        if (filter === 'unread') return !l.is_read;
        if (filter === 'important') return l.is_important;
        return true;
    });

    const handleMarkRead = (id: string, is_read: boolean) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, is_read } : l));
        startTransition(() => void markLeadRead(id, is_read));
    };

    const handleMarkImportant = (id: string, is_important: boolean) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, is_important } : l));
        startTransition(() => void markLeadImportant(id, is_important));
    };

    const handleDelete = (id: string) => {
        if (confirmDelete !== id) {
            setConfirmDelete(id);
            setTimeout(() => setConfirmDelete(null), 3000);
            return;
        }
        setLeads(prev => prev.filter(l => l.id !== id));
        setConfirmDelete(null);
        startTransition(() => void deleteLead(id));
    };

    const handleMarkAllRead = () => {
        setLeads(prev => prev.map(l => ({ ...l, is_read: true })));
        startTransition(() => void markAllLeadsRead());
    };

    return (
        <div className={styles.wrapper}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Cereri Primite</h1>
                    <p className={styles.subtitle}>
                        {leads.length} total &nbsp;·&nbsp;
                        <span style={{ color: currentUnread > 0 ? 'var(--color-primary)' : '#16a34a', fontWeight: 600 }}>
                            {currentUnread} necitite
                        </span>
                    </p>
                </div>
                <div className={styles.headerActions}>
                    {currentUnread > 0 && (
                        <button
                            className={styles.markAllBtn}
                            onClick={handleMarkAllRead}
                            disabled={isPending}
                        >
                            <CheckCheck size={16} />
                            Marchează toate citite
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Toate ({leads.length})
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'unread' ? styles.filterActive : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    <span className={styles.dot} />
                    Necitite ({currentUnread})
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'important' ? styles.filterActive : ''}`}
                    onClick={() => setFilter('important')}
                >
                    <Star size={13} />
                    Importante ({leads.filter(l => l.is_important).length})
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className={styles.empty}>
                    <p>Nu există cereri {filter !== 'all' ? 'în această categorie' : 'încă'}.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {filtered.map((lead) => (
                        <div
                            key={lead.id}
                            className={`${styles.card} ${!lead.is_read ? styles.cardUnread : ''} ${lead.is_important ? styles.cardImportant : ''}`}
                        >
                            {/* Left: Status indicators */}
                            <div className={styles.indicators}>
                                {!lead.is_read && <span className={styles.unreadDot} title="Necitit" />}
                                {lead.is_important && <Star size={12} className={styles.importantStar} />}
                            </div>

                            {/* Main content */}
                            <div className={styles.content}>
                                <div className={styles.row1}>
                                    <div className={styles.nameBlock}>
                                        <span className={styles.name}>{lead.name}</span>
                                        <span className={`${styles.badge} ${lead.is_read ? styles.badgeRead : styles.badgeNew}`}>
                                            {lead.is_read ? 'Citit' : '● Nou'}
                                        </span>
                                        {lead.form_type === 'testdrive' && (
                                            <span className={styles.badgeTestDrive}>📅 Programare</span>
                                        )}
                                        {lead.is_important && (
                                            <span className={styles.badgeImportant}>⭐ Important</span>
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
                                        <CalendarCheck size={13} />
                                        <span>Data preferată: <strong>{lead.preferred_date}</strong></span>
                                    </div>
                                )}
                                {lead.message && (
                                    <p className={styles.message}>&ldquo;{lead.message}&rdquo;</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className={styles.actions}>
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => handleMarkRead(lead.id, !lead.is_read)}
                                    title={lead.is_read ? 'Marchează ca necitit' : 'Marchează ca citit'}
                                >
                                    {lead.is_read ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                                <button
                                    className={`${styles.actionBtn} ${lead.is_important ? styles.actionImportant : ''}`}
                                    onClick={() => handleMarkImportant(lead.id, !lead.is_important)}
                                    title={lead.is_important ? 'Elimină din importante' : 'Marchează ca important'}
                                >
                                    {lead.is_important ? <StarOff size={15} /> : <Star size={15} />}
                                </button>
                                <button
                                    className={`${styles.actionBtn} ${styles.actionDelete} ${confirmDelete === lead.id ? styles.actionDeleteConfirm : ''}`}
                                    onClick={() => handleDelete(lead.id)}
                                    title={confirmDelete === lead.id ? 'Click din nou pentru a confirma' : 'Șterge'}
                                >
                                    <Trash2 size={15} />
                                    {confirmDelete === lead.id && <span className={styles.confirmText}>Confirmi?</span>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
