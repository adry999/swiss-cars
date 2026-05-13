'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft, AlertCircle, X, User } from 'lucide-react';
import { saveReview } from '@/lib/actions/content';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import ImageUploader from './ImageUploader';

import styles from './ReviewForm.module.css';

export default function ReviewForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [contentLang, setContentLang] = useState<'ro' | 'ru' | 'en'>('ro');
    const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatar_url || '');

    const { register, handleSubmit } = useForm({
        defaultValues: initialData || {
            name: '', rating: 5, is_visible: true, content_ro: '', content_ru: '', content_en: ''
        }
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await saveReview({ ...data, avatar_url: avatarUrl || null });
            router.push('/admin/reviews');
            router.refresh();
        } catch (e) {
            setError('Eroare la salvarea review-ului. Încearcă din nou.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>{initialData ? 'Editează Review' : 'Review Nou'}</h2>
                <Link href="/admin/reviews" className="btn btn-outline" style={{ borderColor: 'var(--color-gray-2)', color: '#333' }}><ArrowLeft size={16} /> Înapoi</Link>
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
                <label>Nume autor</label>
                <input {...register('name')} required style={{ padding: '10px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Rating (1-5)</label>
                <input type="number" min="1" max="5" {...register('rating')} required style={{ padding: '10px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Vizibilitate</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" {...register('is_visible')} /> Afișează pe site
                </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} /> Foto autor (opțional)
                </label>
                <ImageUploader
                    value={avatarUrl ? [avatarUrl] : []}
                    onChange={(urls) => setAvatarUrl(urls[0] || '')}
                    maxFiles={1}
                />
                {avatarUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <img
                            src={avatarUrl}
                            alt="Avatar preview"
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid var(--color-primary)'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setAvatarUrl('')}
                            style={{
                                padding: '4px 10px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Elimină foto
                        </button>
                    </div>
                )}
                <p style={{ fontSize: '12px', color: '#999' }}>
                    Recomandare: imagine pătrată, min. 100x100px
                </p>
            </div>

            <div className={styles.field}>
                <label>Conținut review</label>
                <div className={styles.descTabs}>
                    <button
                        type="button"
                        className={`${styles.descTabBtn} ${contentLang === 'ro' ? styles.descTabActive : ''}`}
                        onClick={() => setContentLang('ro')}
                    >
                        RO
                    </button>
                    <button
                        type="button"
                        className={`${styles.descTabBtn} ${contentLang === 'ru' ? styles.descTabActive : ''}`}
                        onClick={() => setContentLang('ru')}
                    >
                        RU
                    </button>
                    <button
                        type="button"
                        className={`${styles.descTabBtn} ${contentLang === 'en' ? styles.descTabActive : ''}`}
                        onClick={() => setContentLang('en')}
                    >
                        EN
                    </button>
                </div>

                {contentLang === 'ro' && (
                    <textarea rows={5} {...register('content_ro')} style={{ padding: '10px', resize: 'vertical' }} placeholder="Review text în Română..." />
                )}
                {contentLang === 'ru' && (
                    <textarea rows={5} {...register('content_ru')} style={{ padding: '10px', resize: 'vertical' }} placeholder="Текст отзыва на Русском..." />
                )}
                {contentLang === 'en' && (
                    <textarea rows={5} {...register('content_en')} style={{ padding: '10px', resize: 'vertical' }} placeholder="Review text in English..." />
                )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                Salvează
            </button>
        </form>
    );
}
