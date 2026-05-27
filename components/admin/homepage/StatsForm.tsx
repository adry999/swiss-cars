'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { HomepageContent } from '@/lib/types';

interface StatsFormProps {
    register: UseFormRegister<HomepageContent>;
}

export default function StatsForm({ register }: StatsFormProps) {
    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Stats Counters Section</h2>
                <p style={{ fontSize: '14px', color: '#666' }}>Manage the 3 animated number counters and the Partnerships descriptive block.</p>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>Counters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#fcfcfc' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', color: '#666', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>Counter {i + 1}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ fontSize: '11px', display: 'block', color: '#888', marginBottom: '4px' }}>Number</label>
                                <input type="number" {...register(`stats_section.stats.${i}.count` as const, { valueAsNumber: true })} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', display: 'block', color: '#888', marginBottom: '4px' }}>Suffix (+)</label>
                                <input {...register(`stats_section.stats.${i}.suffix` as const)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                        </div>
                        <label style={{ fontSize: '11px', display: 'block', color: '#888', marginBottom: '8px' }}>Label (RO, RU, EN)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input {...register(`stats_section.stats.${i}.label.ro` as const)} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register(`stats_section.stats.${i}.label.ru` as const)} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register(`stats_section.stats.${i}.label.en` as const)} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                    </div>
                ))}
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>Partnerships Block</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Title (RO)</label>
                    <input {...register('stats_section.partnerships.title.ro')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Title (RU)</label>
                    <input {...register('stats_section.partnerships.title.ru')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Title (EN)</label>
                    <input {...register('stats_section.partnerships.title.en')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '120px' }}>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Partner Count</label>
                    <input type="number" {...register('stats_section.partnerships.count', { valueAsNumber: true })} style={{ width: '100%', padding: '8px', fontWeight: 'bold', color: 'red' }} />
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Count Suffix (RO)</label>
                        <input {...register('stats_section.partnerships.suffix.ro')} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Count Suffix (RU)</label>
                        <input {...register('stats_section.partnerships.suffix.ru')} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Count Suffix (EN)</label>
                        <input {...register('stats_section.partnerships.suffix.en')} style={{ width: '100%', padding: '8px' }} />
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (RO)</label>
                    <textarea {...register('stats_section.partnerships.text.ro')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (RU)</label>
                    <textarea {...register('stats_section.partnerships.text.ru')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (EN)</label>
                    <textarea {...register('stats_section.partnerships.text.en')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                </div>
            </div>
        </section>
    );
}
