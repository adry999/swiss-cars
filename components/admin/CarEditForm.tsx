'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type FieldErrors, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, FileText, Settings, AlertCircle, X } from 'lucide-react';
import { CarSchema, type Car } from '@/lib/types';
import { saveCar } from '@/lib/actions/cars';
import GeneralInfoTab from './car-edit/GeneralInfoTab';
import SpecsTab from './car-edit/SpecsTab';
import ImagesTab from './car-edit/ImagesTab';
import styles from './CarEditForm.module.css';

type Props = {
    initialData?: Car;
    maxImages?: number;
};

export default function CarEditForm({ initialData, maxImages = 25 }: Props) {
    const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'images'>('general');
    const [descLang, setDescLang] = useState<'ro' | 'ru' | 'en'>('ro');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const router = useRouter();

    const initialImages = useMemo(() => {
        if (!initialData?.car_images) return [];
        return [...initialData.car_images].sort((a, b) => {
            if (a.is_primary) return -1;
            if (b.is_primary) return 1;
            return 0;
        });
    }, [initialData]);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Car>({
        // zodResolver infers against CarSchema's z.preprocess *input* type
        // (unknown, since preprocess accepts raw form values before
        // coercion), which structurally differs from Car — CarSchema's
        // *output*/parsed type, and what every field below is typed
        // against. Asserting the named Resolver<Car> type here is the
        // documented workaround for schemas with preprocess/transform
        // without threading a second, input-shaped generic through every
        // child component's register/watch/setValue/errors props.
        resolver: zodResolver(CarSchema) as Resolver<Car>,
        defaultValues: initialData || {
            is_available: true,
            is_featured: false,
            year: new Date().getFullYear(),
        },
    });

    const onInvalid = (errs: FieldErrors<Car>) => {
        console.error('Validation Errors:', errs);
        setFormError('Please check the form for errors. Some required fields might be missing or invalid.');
    };

    const onSubmit = async (data: Car) => {
        setIsSubmitting(true);
        setFormError(null);
        try {
            const result = await saveCar(data);
            if (result.success) {
                router.push('/admin/inventory');
                router.refresh();
            }
        } catch (error) {
            console.error('Save failed:', error);
            setFormError('Failed to save car. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className={styles.form}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button type="button" onClick={() => router.back()} className={styles.backBtn}>
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className={styles.title}>
                        {initialData ? `Edit ${initialData.brand} ${initialData.model}` : 'Add New Car'}
                    </h1>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    {isSubmitting ? <Loader2 className={styles.spinner} /> : <Save size={18} className="me-2" />}
                    Save Car
                </button>
            </header>

            <div className={styles.tabs}>
                {([
                    { id: 'general', icon: <FileText size={18} />, label: 'General Info' },
                    { id: 'specs', icon: <Settings size={18} />, label: 'Technical Specs' },
                    { id: 'images', icon: <ImageIcon size={18} />, label: 'Images' },
                ] as const).map(({ id, icon, label }) => (
                    <button
                        key={id}
                        type="button"
                        className={`${styles.tab} ${activeTab === id ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(id)}
                    >
                        {icon} {label}
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {(formError || Object.keys(errors).length > 0) && (
                    <div className={styles.formError}>
                        <AlertCircle size={20} />
                        <span>{formError || 'There are errors in the form. Please check all tabs.'}</span>
                        {formError && (
                            <button type="button" className={styles.dismissBtn} onClick={() => setFormError(null)}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}

                {activeTab === 'general' && (
                    <GeneralInfoTab
                        register={register}
                        errors={errors}
                        descLang={descLang}
                        onDescLangChange={setDescLang}
                    />
                )}
                {activeTab === 'specs' && <SpecsTab register={register} />}
                {activeTab === 'images' && (
                    <ImagesTab
                        watch={watch}
                        setValue={setValue}
                        maxImages={maxImages}
                        initialImages={initialImages}
                    />
                )}
            </div>
        </form>
    );
}
