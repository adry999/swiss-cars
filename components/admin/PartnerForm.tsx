'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft, AlertCircle, X } from 'lucide-react';
import { savePartner } from '@/lib/actions/content';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import ImageUploader from '@/components/admin/ImageUploader';

export default function PartnerForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: initialData || {
            name: '', website_url: '', sort_order: 0, is_visible: true, logo_url: ''
        }
    });

    const logoUrl = watch('logo_url');

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await savePartner(data);
            router.push('/admin/partners');
            router.refresh();
        } catch (e) {
            setError('Error saving partner. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>{initialData ? 'Edit Partner' : 'New Partner'}</h2>
                <Link href="/admin/partners" className="btn btn-outline" style={{ borderColor: 'var(--color-gray-2)', color: '#333' }}><ArrowLeft size={16} /> Back</Link>
            </div>

            {error && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '14px',
                }}>
                    <AlertCircle size={18} />
                    <span style={{ flex: 1 }}>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Partner Name</label>
                <input {...register('name')} required style={{ padding: '10px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Website URL</label>
                <input {...register('website_url')} style={{ padding: '10px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Sort Order (Higher first)</label>
                <input type="number" {...register('sort_order')} style={{ padding: '10px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Visibility</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" {...register('is_visible')} /> Show on website
                </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Logo</label>
                <ImageUploader
                    value={logoUrl ? [logoUrl] : []}
                    onChange={(urls) => setValue('logo_url', urls.length > 0 ? urls[0] : '')}
                    maxFiles={1}
                />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                Save
            </button>
        </form>
    );
}
