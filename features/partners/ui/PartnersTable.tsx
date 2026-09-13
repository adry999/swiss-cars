'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Eye, EyeOff, ExternalLink, Edit } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import { deletePartner, savePartner } from '../actions';
import { type Partner } from '../partners.types';
import styles from './PartnersTable.module.css';

export default function PartnersTable({ partners }: { partners: Partner[] }) {
    const router = useRouter();

    const removePartner = async (id: string) => {
        if (!confirm('Ești sigur că vrei să ștergi acest partener?')) return;
        const result = await deletePartner(id);
        if (result.status === 'succeeded') {
            router.refresh();
        } else {
            alert('Ștergerea a eșuat');
        }
    };

    const togglePartnerVisibility = async (p: Partner) => {
        const result = await savePartner({ ...p, is_visible: !p.is_visible });
        if (result.status === 'succeeded') {
            router.refresh();
        } else {
            alert('Actualizarea a eșuat');
        }
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
        { header: 'Ordine', accessor: 'sort_order' as const },
        {
            header: 'Status',
            accessor: (p: Partner) => (
                <span className={p.is_visible ? 'badge-success' : 'badge-muted'}>
                    {p.is_visible ? 'Vizibil' : 'Ascuns'}
                </span>
            )
        },
    ];

    return (
        <DataTable
            data={partners}
            columns={columns}
            actions={(p) => (
                <div className={styles.actions}>
                    <button
                        className={'action-btn'}
                        onClick={() => togglePartnerVisibility(p)}
                    >
                        {p.is_visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                        className={'action-btn'}
                        onClick={() => router.push(`/admin/partners/${p.id}`)}
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className={`${'action-btn'} ${'action-btn-delete'}`}
                        onClick={() => removePartner(p.id!)}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        />
    );
}
