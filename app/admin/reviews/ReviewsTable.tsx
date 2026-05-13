'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Trash2, Star, Eye, EyeOff, Edit } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/ui/Pagination';
import { deleteReview, saveReview } from '@/lib/actions/content';
import { type Review } from '@/lib/types';
import styles from './page.module.css';

type Props = {
    reviews: Review[];
    currentPage: number;
    totalPages: number;
};

export default function ReviewsTable({ reviews, currentPage, totalPages }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`?${params.toString()}`);
    };

    const onDelete = async (id: string) => {
        if (!confirm('Ești sigur că vrei să ștergi această recenzie?')) return;
        await deleteReview(id);
        router.refresh();
    };

    const onToggleVisibility = async (review: Review) => {
        await saveReview({ ...review, is_visible: !review.is_visible });
        router.refresh();
    };

    const columns = [
        {
            header: 'Autor',
            accessor: (r: Review) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {r.avatar_url ? (
                        <img
                            src={r.avatar_url}
                            alt={r.name}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid var(--color-primary)'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '14px'
                        }}>
                            {r.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span>{r.name}</span>
                </div>
            )
        },
        {
            header: 'Rating',
            accessor: (r: Review) => (
                <div style={{ display: 'flex', color: '#f1c40f' }}>
                    {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
            )
        },
        {
            header: 'Recenzie (RO)',
            accessor: (r: Review) => <div className={styles.contentPreview}>{r.content_ro}</div>,
            width: '40%'
        },
        {
            header: 'Status',
            accessor: (r: Review) => (
                <span className={r.is_visible ? styles.badgeSuccess : styles.badgeMuted}>
                    {r.is_visible ? 'Vizibil' : 'Ascuns'}
                </span>
            )
        },
    ];

    return (
        <>
            <DataTable
                data={reviews}
                columns={columns as any}
                actions={(r) => (
                    <div className={styles.actions}>
                        <button
                            className={styles.actionBtn}
                            onClick={() => onToggleVisibility(r)}
                            title={r.is_visible ? 'Hide' : 'Show'}
                        >
                            {r.is_visible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                            className={styles.actionBtn}
                            onClick={() => router.push(`/admin/reviews/${r.id}`)}
                            title="Edit Review"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => onDelete(r.id!)}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </>
    );
}
