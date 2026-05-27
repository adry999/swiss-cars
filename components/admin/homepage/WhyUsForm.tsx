'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { HomepageContent } from '@/lib/types';

interface WhyUsFormProps {
    register: UseFormRegister<HomepageContent>;
}

export default function WhyUsForm({ register }: WhyUsFormProps) {
    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Why Us (FAQ) Section</h2>
            </div>
            <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#888', marginBottom: '8px' }}>Main Title (RO, RU, EN)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input {...register('why_us_section.title.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('why_us_section.title.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <input {...register('why_us_section.title.en')} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', background: '#fcfcfc' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', color: '#666', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>Question {i + 1}</div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#888' }}>Title (RO, RU, EN)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <input {...register(`why_us_section.items.${i}.title.ro` as const)} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register(`why_us_section.items.${i}.title.ru` as const)} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register(`why_us_section.items.${i}.title.en` as const)} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#888' }}>Text (RO, RU, EN)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <textarea {...register(`why_us_section.items.${i}.text.ro` as const)} placeholder="RO" rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                            <textarea {...register(`why_us_section.items.${i}.text.ru` as const)} placeholder="RU" rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                            <textarea {...register(`why_us_section.items.${i}.text.en` as const)} placeholder="EN" rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
