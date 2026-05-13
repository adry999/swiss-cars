'use client';

import { useState } from 'react';
import { Save, Loader2, Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { saveSettings } from '@/lib/actions/settings';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import ImageUploader from '@/components/admin/ImageUploader';
import { useToast } from '@/components/ui/Toast';

export default function HomepageForm({ initialData }: { initialData?: any }) {
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    const { control, register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            hero_slides: initialData?.hero_slides || [
                {
                    imageSrc: '/media/content/b-main-slider/slider.png',
                    slogan: { ro: 'EȘTI GATA SĂ', ru: 'Готов к', en: 'Are you ready to' },
                    title: { ro: 'CUMPERI O MAȘINĂ?', ru: 'Покупке авто?', en: 'Buy a car?' },
                    cta: { ro: 'VEZI OFERTE', ru: 'Смотреть предложения', en: 'View offers' },
                    ctaHref: '#offers'
                }
            ],
            about_section: initialData?.about_section || {
                subtitle: { ro: 'Puțin despre noi', ru: 'Немного о нас', en: 'A little about us' },
                title: { ro: 'CINE SUNTEM NOI', ru: 'КТО МЫ', en: 'WHO WE ARE' },
                text: {
                    ro: 'Suntem o companie specializată în importul și vânzarea de automobile din Elveția...',
                    ru: 'Мы компания, специализирующаяся на импорте и продаже автомобилей из Швейцарии...',
                    en: 'We are a company specializing in the import and sale of cars from Switzerland...'
                }
            },
            stats_section: initialData?.stats_section || {
                stats: [
                    { count: 500, suffix: '+', label: { ro: 'Masini importate', ru: 'Импортированных авто', en: 'Imported cars' } },
                    { count: 265, suffix: '', label: { ro: 'Masini transportate', ru: 'Перевезенных авто', en: 'Transported cars' } },
                    { count: 1450, suffix: '', label: { ro: 'Piese auto la reducere', ru: 'Автозапчастей со скидкой', en: 'Discounted car parts' } }
                ],
                partnerships: {
                    title: { ro: 'Avem peste 10 ani de parteneriate cu mai mult de', ru: 'У нас более 10 лет партнерства с более чем', en: 'We have over 10 years of partnerships with more than' },
                    count: 50,
                    suffix: { ro: 'de companii', ru: 'компаниями', en: 'companies' },
                    text: {
                        ro: 'Suntem mandri sa fim la randul nostru selectati ca si parteneri de...',
                        ru: 'Мы гордимся тем, что нас также выбирают партнерами...',
                        en: 'We are proud to be selected as partners by...'
                    }
                }
            },
            services_section: initialData?.services_section || {
                title: { ro: 'Serviciile Noastre', ru: 'Наши Услуги', en: 'Our Services' },
                imageSrc: '/media/content/b-services/fig-1.png',
                services: [
                    { icon: '🔍', name: { ro: 'Consultanta', ru: 'Консультация', en: 'Consulting' }, short: { ro: 'Gratuita', ru: 'Бесплатно', en: 'Free' }, full: { ro: '', ru: '', en: '' } },
                    { icon: '🔧', name: { ro: 'Verificare', ru: 'Проверка', en: 'Checking' }, short: { ro: 'Completa', ru: 'Полная', en: 'Full' }, full: { ro: '', ru: '', en: '' } },
                    { icon: '🚚', name: { ro: 'Transport', ru: 'Транспорт', en: 'Transport' }, short: { ro: 'Sigur', ru: 'Надежный', en: 'Safe' }, full: { ro: '', ru: '', en: '' } },
                    { icon: '🏷️', name: { ro: 'Vamuire', ru: 'Таможня', en: 'Customs' }, short: { ro: 'Rapida', ru: 'Быстро', en: 'Fast' }, full: { ro: '', ru: '', en: '' } },
                    { icon: '⚙️', name: { ro: 'Inmatriculare', ru: 'Регистрация', en: 'Registration' }, short: { ro: 'Moldova', ru: 'Молдова', en: 'Moldova' }, full: { ro: '', ru: '', en: '' } },
                    { icon: '🛡️', name: { ro: 'Leasing', ru: 'Лизинг', en: 'Leasing' }, short: { ro: 'Inclus', ru: 'Включен', en: 'Included' }, full: { ro: '', ru: '', en: '' } },
                ]
            },
            leasing_section: initialData?.leasing_section || {
                title: { ro: 'Leasing Auto', ru: 'Авто Лизинг', en: 'Car Leasing' },
                text1: { ro: '', ru: '', en: '' },
                text2: { ro: '', ru: '', en: '' }
            },
            contact_banner: initialData?.contact_banner || {
                title: { ro: '', ru: '', en: '' },
                text: { ro: '', ru: '', en: '' },
                question: { ro: '', ru: '', en: '' },
                cta: { ro: '', ru: '', en: '' }
            },
            why_us_section: initialData?.why_us_section || {
                title: { ro: 'De ce să ne alegi?', ru: 'Почему выбирают нас?', en: 'Why choose us?' },
                items: [
                    { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } },
                    { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } },
                    { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } },
                    { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } }
                ]
            }
        }
    });

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: 'hero_slides'
    });

    const onSubmit = async (data: any) => {
        setIsSaving(true);
        try {
            const res = await saveSettings('homepage_content', data);
            if (res.success) {
                toast.success('Homepage content saved successfully!');
            } else {
                toast.error('Failed to save homepage content.');
            }
        } catch (e) {
            toast.error('Error saving homepage content.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Homepage Editor</h1>
                <button type="button" onClick={handleSubmit(onSubmit)} className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? <Loader2 className="spinner" size={16} /> : <Save size={16} className="me-2" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* HERO SLIDER SECTION */}
                <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Hero Slider Images & Texts</h2>
                        <button type="button" onClick={() => append({ imageSrc: '', slogan: { ro: '', ru: '', en: '' }, title: { ro: '', ru: '', en: '' }, cta: { ro: '', ru: '', en: '' }, ctaHref: '#offers' })} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px', borderColor: '#ccc', color: '#333' }}>
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
                                        <button type="button" onClick={() => remove(index)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', marginLeft: '12px' }}>
                                            <Trash2 size={16} />
                                        </button>
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

                {/* ABOUT US SECTION */}
                <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>About Us Section</h2>
                        <p style={{ fontSize: '14px', color: '#666' }}>Manage the subtitle, title, and descriptive text shown in the "About Us" section on the homepage.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Subtitles */}
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

                        {/* Titles */}
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

                        {/* Texts */}
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
                {/* STATS SECTION */}
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
                                        <input type="number" {...register(`stats_section.stats.${i}.count`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', display: 'block', color: '#888', marginBottom: '4px' }}>Suffix (+)</label>
                                        <input {...register(`stats_section.stats.${i}.suffix`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    </div>
                                </div>
                                <label style={{ fontSize: '11px', display: 'block', color: '#888', marginBottom: '8px' }}>Label (RO, RU, EN)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <input {...register(`stats_section.stats.${i}.label.ro`)} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    <input {...register(`stats_section.stats.${i}.label.ru`)} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    <input {...register(`stats_section.stats.${i}.label.en`)} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
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
                            <input type="number" {...register('stats_section.partnerships.count')} style={{ width: '100%', padding: '8px', fontWeight: 'bold', color: 'red' }} />
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

                {/* SERVICES SECTION */}
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
                                name={`services_section.imageSrc`}
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
                                        <input {...register(`services_section.services.${i}.icon`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center', fontSize: '16px' }} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Name (RO)</label>
                                            <input {...register(`services_section.services.${i}.name.ro`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Short Result (RO)</label>
                                            <input {...register(`services_section.services.${i}.short.ro`)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        </div>
                                    </div>
                                </div>
                                <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#888' }}>Full Description (RO)</label>
                                <textarea {...register(`services_section.services.${i}.full.ro`)} rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* LEASING SECTION */}
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

                {/* CONTACT BANNER SECTION */}
                <section style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '32px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Contact Banner Section</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888' }}>Banner Title (RO, RU, EN)</label>
                            <input {...register('contact_banner.title.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register('contact_banner.title.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register('contact_banner.title.en')} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888' }}>Banner Text (RO, RU, EN)</label>
                            <input {...register('contact_banner.text.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register('contact_banner.text.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register('contact_banner.text.en')} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888' }}>Question Text (RO, RU, EN)</label>
                            <input {...register('contact_banner.question.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register('contact_banner.question.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register('contact_banner.question.en')} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888' }}>CTA Button (RO, RU, EN)</label>
                            <input {...register('contact_banner.cta.ro')} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register('contact_banner.cta.ru')} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            <input {...register('contact_banner.cta.en')} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                    </div>
                </section>

                {/* WHY US SECTION (FAQ) */}
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
                                    <input {...register(`why_us_section.items.${i}.title.ro`)} placeholder="RO" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    <input {...register(`why_us_section.items.${i}.title.ru`)} placeholder="RU" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    <input {...register(`why_us_section.items.${i}.title.en`)} placeholder="EN" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                </div>

                                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#888' }}>Text (RO, RU, EN)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <textarea {...register(`why_us_section.items.${i}.text.ro`)} placeholder="RO" rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                                    <textarea {...register(`why_us_section.items.${i}.text.ru`)} placeholder="RU" rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                                    <textarea {...register(`why_us_section.items.${i}.text.en`)} placeholder="EN" rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? <Loader2 className="spinner" size={16} /> : <Save size={16} className="me-2" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div >
    );
}
