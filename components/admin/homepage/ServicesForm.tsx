'use client';

import { Controller, type Control, type UseFormRegister } from 'react-hook-form';
import ImageUploader from '@/components/admin/ImageUploader';
import type { HomepageContent } from '@/lib/types';

interface ServicesFormProps {
    control: Control<HomepageContent>;
    register: UseFormRegister<HomepageContent>;
}

export default function ServicesForm({ control, register }: ServicesFormProps) {
    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Services Section</h2>
                <p style={{ fontSize: '14px', color: '#666' }}>Manage the 6 service tabs, image and content shown on the left panel.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Main Title (RO, RU, EN)</label>
                    <input {...register('services_section.title.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', marginBottom: '4px' }} />
                    <input {...register('services_section.title.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', marginBottom: '4px' }} />
                    <input {...register('services_section.title.en')} placeholder="EN" style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Left Panel Image</label>
                    <Controller
                        control={control}
                        name="services_section.imageSrc"
                        render={({ field: { onChange, value } }) => (
                            <ImageUploader
                                value={value ? [value] : []}
                                onChange={(urls) => onChange(urls.length > 0 ? urls[0] : '')}
                                maxFiles={1}
                            />
                        )}
                    />
                </div>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>Service Tabs (max 6)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#fcfcfc' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', color: '#666', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>Tab {i + 1}</div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ width: '60px' }}>
                                <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Icon</label>
                                <input {...register(`services_section.services.${i}.icon` as const)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center', fontSize: '16px' }} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Name (RO)</label>
                                    <input {...register(`services_section.services.${i}.name.ro` as const)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Short Result (RO)</label>
                                    <input {...register(`services_section.services.${i}.short.ro` as const)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                </div>
                            </div>
                        </div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Full Description (RO)</label>
                        <textarea {...register(`services_section.services.${i}.full.ro` as const)} rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                    </div>
                ))}
            </div>
        </section>
    );
}
