'use client';

import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { saveSettings } from '../actions';
import { useForm } from 'react-hook-form';
import { useToast } from '@shared/ui/Toast/ToastContext';
import type { HomepageContent } from '../site-settings.types';
import HomepageHeroForm from './HomepageHeroForm';
import HomepageAboutForm from './HomepageAboutForm';
import HomepageStatsForm from './HomepageStatsForm';
import HomepageServicesForm from './HomepageServicesForm';
import HomepageLeasingForm from './HomepageLeasingForm';
import HomepageContactBannerForm from './HomepageContactBannerForm';
import HomepageWhyUsForm from './HomepageWhyUsForm';

const DEFAULT_CONTENT: HomepageContent = {
    hero_slides: [
        {
            imageSrc: '/media/content/b-main-slider/slider.png',
            slogan: { ro: 'EȘTI GATA SĂ', ru: 'Готов к', en: 'Are you ready to' },
            title: { ro: 'CUMPERI O MAȘINĂ?', ru: 'Покупке авто?', en: 'Buy a car?' },
            cta: { ro: 'VEZI OFERTE', ru: 'Смотреть предложения', en: 'View offers' },
            ctaHref: '#offers'
        }
    ],
    about_section: {
        subtitle: { ro: 'Puțin despre noi', ru: 'Немного о нас', en: 'A little about us' },
        title: { ro: 'CINE SUNTEM NOI', ru: 'КТО МЫ', en: 'WHO WE ARE' },
        text: {
            ro: 'Suntem o companie specializată în importul și vânzarea de automobile din Elveția...',
            ru: 'Мы компания, специализирующаяся на импорте и продаже автомобилей из Швейцарии...',
            en: 'We are a company specializing in the import and sale of cars from Switzerland...'
        }
    },
    stats_section: {
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
    services_section: {
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
    leasing_section: {
        title: { ro: 'Leasing Auto', ru: 'Авто Лизинг', en: 'Car Leasing' },
        text1: { ro: '', ru: '', en: '' },
        text2: { ro: '', ru: '', en: '' }
    },
    contact_banner: {
        title: { ro: '', ru: '', en: '' },
        text: { ro: '', ru: '', en: '' },
        question: { ro: '', ru: '', en: '' },
        cta: { ro: '', ru: '', en: '' }
    },
    why_us_section: {
        title: { ro: 'De ce să ne alegi?', ru: 'Почему выбирают нас?', en: 'Why choose us?' },
        items: [
            { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } },
            { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } },
            { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } },
            { title: { ro: '', ru: '', en: '' }, text: { ro: '', ru: '', en: '' } }
        ]
    }
};

export default function HomepageContentForm({ initialData }: { initialData?: HomepageContent }) {
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    const { control, register, handleSubmit } = useForm<HomepageContent>({
        defaultValues: initialData || DEFAULT_CONTENT,
    });

    const onSubmit = async (data: HomepageContent) => {
        setIsSaving(true);
        try {
            const res = await saveSettings('homepage_content', data);
            if (res.success) {
                toast.success('Homepage content saved successfully!');
            } else {
                toast.error('Failed to save homepage content.');
            }
        } catch {
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
                <HomepageHeroForm control={control} register={register} />
                <HomepageAboutForm register={register} />
                <HomepageStatsForm register={register} />
                <HomepageServicesForm control={control} register={register} />
                <HomepageLeasingForm register={register} />
                <HomepageContactBannerForm register={register} />
                <HomepageWhyUsForm register={register} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? <Loader2 className="spinner" size={16} /> : <Save size={16} className="me-2" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
