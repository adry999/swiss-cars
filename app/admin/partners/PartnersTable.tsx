'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Eye, EyeOff, ExternalLink, Edit } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import { deletePartner, savePartner } from '@/lib/actions/content';
import { type Partner } from '@/lib/types';
import styles from './page.module.css';

export default function PartnersTable({ partners }: { partners: Partner[] }) {
    const router = useRouter();

    const onDelete = async (id: string) => {
        if (!confirm('Ești sigur că vrei să ștergi acest partener?')) return;
        await deletePartner(id);
        router.refresh();
    };

    const onToggleVisibility = async (p: Partner) => {
        await savePartner({ ...p, is_visible: !p.is_visible });
        router.refresh();
    };

    const columns = [
        {
            header: 'Partener',
            accessor: (p: Partner) => (
                <div className={styles.partnerInfo}>
                    {p.logo_url && (
                        <div className={styles.logoWrap}>
                            <Image src={p.logo_url} alt={p.name || ''} fill className={styles.logo} />
                        </div>
                    )}
                    <span>{p.name}</span>
                </div>
            )
        },
        {
            header: 'Website',
            accessor: (p: Partner) => p.website_url ? (
                <a href={p.website_url} target="_blank" className={styles.link}>
                    {p.website_url} <ExternalLink size={12} />
                </a>
            ) : '-'
        },
        { header: 'Ordine', accessor: 'sort_order' as any },
        {
            header: 'Status',
            accessor: (p: Partner) => (
                <span className={p.is_visible ? styles.badgeSuccess : styles.badgeMuted}>
                    {p.is_visible ? 'Vizibil' : 'Ascuns'}
                </span>
            )
        },
    ];

    return (
        <DataTable
            data={partners}
            columns={columns as any}
            actions={(p) => (
                <div className={styles.actions}>
                    <button
                        className={styles.actionBtn}
                        onClick={() => onToggleVisibility(p)}
                    >
                        {p.is_visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                        className={styles.actionBtn}
                        onClick={() => router.push(`/admin/partners/${p.id}`)}
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => onDelete(p.id!)}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        />
    );
}
