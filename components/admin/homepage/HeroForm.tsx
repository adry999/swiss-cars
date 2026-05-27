'use client';

import { useFieldArray, Controller, type Control, type UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import type { HomepageContent } from '@/lib/types';

interface HeroFormProps {
    control: Control<HomepageContent>;
    register: UseFormRegister<HomepageContent>;
}

export default function HeroForm({ control, register }: HeroFormProps) {
    const { fields, append, remove, move } = useFieldArray({ control, name: 'hero_slides' });

    return (
        <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Hero Slider Images & Texts</h2>
                <button
                    type="button"
                    onClick={() => append({ imageSrc: '', slogan: { ro: '', ru: '', en: '' }, title: { ro: '', ru: '', en: '' }, cta: { ro: '', ru: '', en: '' }, ctaHref: '#offers' })}
                    className="btn btn-outline"
                    style={{ padding: '8px 12px', fontSize: '12px', borderColor: '#ccc', color: '#333' }}
                >
                    <Plus size={14} className="me-2" /> Add Slide
                </button>
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Manage the sliding images at the very top of the homepage.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {fields.map((field, index) => (
                    <div key={field.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', position: 'relative', background: '#fcfcfc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#999' }}>Slide {index + 1}</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="button" onClick={() => index > 0 && move(index, index - 1)} disabled={index === 0} style={{ border: 'none', background: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}>↑</button>
                                <button type="button" onClick={() => index < fields.length - 1 && move(index, index + 1)} disabled={index === fields.length - 1} style={{ border: 'none', background: 'none', cursor: index === fields.length - 1 ? 'not-allowed' : 'pointer', opacity: index === fields.length - 1 ? 0.3 : 1 }}>↓</button>
                                <button type="button" onClick={() => remove(index)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', marginLeft: '12px' }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Background Image</label>
                                <Controller
                                    control={control}
                                    name={`hero_slides.${index}.imageSrc`}
                                    render={({ field: { onChange, value } }) => (
                                        <ImageUploader
                                            value={value ? [value] : []}
                                            onChange={(urls) => onChange(urls.length > 0 ? urls[0] : '')}
                                            maxFiles={1}
                                        />
                                    )}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Slogan (RO)</label>
                                        <input {...register(`hero_slides.${index}.slogan.ro`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Slogan (RU)</label>
                                        <input {...register(`hero_slides.${index}.slogan.ru`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Slogan (EN)</label>
                                        <input {...register(`hero_slides.${index}.slogan.en`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Main Title (RO)</label>
                                        <input {...register(`hero_slides.${index}.title.ro`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Main Title (RU)</label>
                                        <input {...register(`hero_slides.${index}.title.ru`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#888' }}>Main Title (EN)</label>
                                        <input {...register(`hero_slides.${index}.title.en`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Button Text (RO, RU, EN)</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input {...register(`hero_slides.${index}.cta.ro`)} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                            <input {...register(`hero_slides.${index}.cta.ru`)} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                            <input {...register(`hero_slides.${index}.cta.en`)} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Button Link</label>
                                        <input {...register(`hero_slides.${index}.ctaHref`)} style={{ width: '100%', padding: '8px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
