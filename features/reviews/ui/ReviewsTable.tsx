'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Trash2, Star, Eye, EyeOff, Edit } from 'lucide-react';
import DataTable from '@shared/ui/admin/DataTable';
import Pagination from '@shared/ui/Pagination';
import { deleteReview, saveReview } from '../actions';
import { type Review } from '../reviews.types';
import styles from './ReviewsTable.module.css';

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

    const removeReview = async (id: string) => {
        if (!confirm('Ești sigur că vrei să ștergi această recenzie?')) return;
        const result = await deleteReview(id);
        if (result.status === 'succeeded') {
            router.refresh();
        } else {
            alert('Ștergerea a eșuat');
        }
    };

    const toggleReviewVisibility = async (review: Review) => {
        const result = await saveReview({ ...review, is_visible: !review.is_visible });
        if (result.status === 'succeeded') {
            router.refresh();
        } else {
            alert('Actualizarea a eșuat');
        }
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
                <span className={r.is_visible ? 'badge-success' : 'badge-muted'}>
                    {r.is_visible ? 'Vizibil' : 'Ascuns'}
                </span>
            )
        },
    ];

    return (
        <>
            <DataTable
                data={reviews}
                columns={columns}
                actions={(r) => (
                    <div className={styles.actions}>
                        <button
                            className={'action-btn'}
                            onClick={() => toggleReviewVisibility(r)}
                            title={r.is_visible ? 'Hide' : 'Show'}
                        >
                            {r.is_visible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                            className={'action-btn'}
                            onClick={() => router.push(`/admin/reviews/${r.id}`)}
                            title="Edit Review"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            className={`${'action-btn'} ${'action-btn-delete'}`}
                            onClick={() => removeReview(r.id!)}
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
