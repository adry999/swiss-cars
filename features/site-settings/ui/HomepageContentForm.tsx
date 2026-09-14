'use client';

import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { saveHomepageContent } from '../actions';
import { useForm } from 'react-hook-form';
import { useToast } from '@shared/ui/Toast/ToastContext';
import type { HomepageContent } from '../site-settings.types';
import { DEFAULT_HOMEPAGE_CONTENT } from '../model/default-homepage-content';
import HomepageHeroForm from './HomepageHeroForm';
import HomepageAboutForm from './HomepageAboutForm';
import HomepageStatsForm from './HomepageStatsForm';
import HomepageServicesForm from './HomepageServicesForm';
import HomepageLeasingForm from './HomepageLeasingForm';
import HomepageContactBannerForm from './HomepageContactBannerForm';
import HomepageWhyUsForm from './HomepageWhyUsForm';

export default function HomepageContentForm({ initialData }: { initialData?: Partial<HomepageContent> }) {
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    // The stored row can lack whole sections (no row yet reads as {}); those start from the defaults.
    const { control, register, handleSubmit } = useForm<HomepageContent>({
        defaultValues: { ...DEFAULT_HOMEPAGE_CONTENT, ...initialData },
    });

    const onSubmit = async (data: HomepageContent) => {
        setIsSaving(true);
        try {
            const result = await saveHomepageContent(data);
            if (result.status === 'succeeded') {
                toast.success('Homepage content saved successfully!');
            } else if (result.reason === 'invalid-input') {
                toast.error(`Invalid fields: ${result.invalidFields?.join(', ')}`);
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
