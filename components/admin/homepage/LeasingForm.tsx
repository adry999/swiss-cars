'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { HomepageContent } from '@/lib/types';

interface LeasingFormProps {
    register: UseFormRegister<HomepageContent>;
}

export default function LeasingForm({ register }: LeasingFormProps) {
    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Leasing Section</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (RO)</label>
                    <input {...register('leasing_section.title.ro')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (RU)</label>
                    <input {...register('leasing_section.title.ru')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (EN)</label>
                    <input {...register('leasing_section.title.en')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Block 1 (RO, RU, EN)</label>
                    <textarea {...register('leasing_section.text1.ro')} placeholder="RO" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px', resize: 'vertical' }} />
                    <textarea {...register('leasing_section.text1.ru')} placeholder="RU" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px', resize: 'vertical' }} />
                    <textarea {...register('leasing_section.text1.en')} placeholder="EN" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                </div>
                <div>
                    <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Block 2 (RO, RU, EN)</label>
                    <textarea {...register('leasing_section.text2.ro')} placeholder="RO" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px', resize: 'vertical' }} />
                    <textarea {...register('leasing_section.text2.ru')} placeholder="RU" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px', resize: 'vertical' }} />
                    <textarea {...register('leasing_section.text2.en')} placeholder="EN" rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                </div>
            </div>
        </section>
    );
}
