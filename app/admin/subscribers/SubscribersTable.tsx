'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ToggleLeft, ToggleRight, Mail } from 'lucide-react';
import { deleteSubscriber, toggleSubscriberStatus, type Subscriber } from '@/lib/actions/subscribers';
import { useToast } from '@/components/ui/Toast';
import { formatDistanceToNow } from 'date-fns';
import DataTable from '@/components/admin/DataTable';

type Props = {
    subscribers: Subscriber[];
};

export default function SubscribersTable({ subscribers }: Props) {
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Ești sigur că vrei să ștergi acest abonat?')) return;

        setLoading(id);
        const result = await deleteSubscriber(id);
        setLoading(null);

        if (result.success) {
            toast.success('Abonat șters cu succes');
            router.refresh();
        } else {
            toast.error('Eroare la ștergerea abonatului');
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        setLoading(id);
        const result = await toggleSubscriberStatus(id, !currentStatus);
        setLoading(null);

        if (result.success) {
            toast.success(currentStatus ? 'Abonat dezactivat' : 'Abonat activat');
            router.refresh();
        } else {
            toast.error('Eroare la actualizarea abonatului');
        }
    };

    if (subscribers.length === 0) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '60px 40px',
                textAlign: 'center',
                border: '1px dashed #ddd'
            }}>
                <Mail size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Nu există abonați</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>
                    Abonații la newsletter vor apărea aici când utilizatorii se înscriu.
                </p>
            </div>
        );
    }

    const columns = [
        {
            header: 'Email',
            accessor: (sub: Subscriber) => (
                <a href={`mailto:${sub.email}`} style={{ color: '#333', fontWeight: '500', textDecoration: 'none' }}>
                    {sub.email}
                </a>
            )
        },
        {
            header: 'Status',
            accessor: (sub: Subscriber) => (
                <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: sub.is_active ? '#dcfce7' : '#fee2e2',
                    color: sub.is_active ? '#16a34a' : '#dc2626'
                }}>
                    {sub.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Subscribed',
            accessor: (sub: Subscriber) => formatDistanceToNow(new Date(sub.subscribed_at), { addSuffix: true })
        }
    ];

    return (
        <DataTable
            data={subscribers}
            columns={columns}
            actions={(sub) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => handleToggle(sub.id, sub.is_active)}
                        disabled={loading === sub.id}
                        title={sub.is_active ? 'Deactivate' : 'Activate'}
                        style={{
                            background: 'none',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: loading === sub.id ? 0.5 : 1
                        }}
                    >
                        {sub.is_active ? <ToggleRight size={16} color="#16a34a" /> : <ToggleLeft size={16} color="#999" />}
                    </button>
                    <button
                        onClick={() => handleDelete(sub.id)}
                        disabled={loading === sub.id}
                        title="Delete"
                        style={{
                            background: 'none',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: loading === sub.id ? 0.5 : 1
                        }}
                    >
                        <Trash2 size={16} color="#dc2626" />
                    </button>
                </div>
            )}
        />
    );
}
