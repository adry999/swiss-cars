'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { HomepageContent } from '@/lib/types';

interface AboutFormProps {
    register: UseFormRegister<HomepageContent>;
}

export default function AboutForm({ register }: AboutFormProps) {
    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>About Us Section</h2>
                <p style={{ fontSize: '14px', color: '#666' }}>Manage the subtitle, title, and descriptive text shown in the &quot;About Us&quot; section on the homepage.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Subtitle (RO)</label>
                        <input {...register('about_section.subtitle.ro')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Subtitle (RU)</label>
                        <input {...register('about_section.subtitle.ru')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Subtitle (EN)</label>
                        <input {...register('about_section.subtitle.en')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (RO)</label>
                        <input {...register('about_section.title.ro')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (RU)</label>
                        <input {...register('about_section.title.ru')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Title (EN)</label>
                        <input {...register('about_section.title.en')} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (RO)</label>
                        <textarea {...register('about_section.text.ro')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (RU)</label>
                        <textarea {...register('about_section.text.ru')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Text Paragraph (EN)</label>
                        <textarea {...register('about_section.text.en')} rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                    </div>
                </div>
            </div>
        </section>
    );
}
