'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, FileText, Settings, AlertCircle, X } from 'lucide-react';
import { CarSchema, type Car } from '@/lib/types';
import { saveCar } from '@/lib/actions/cars';
import ImageUploader from './ImageUploader';
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

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<Car>({
        resolver: zodResolver(CarSchema) as any,
        defaultValues: initialData || {
            is_available: true,
            is_featured: false,
            year: new Date().getFullYear(),
        }
    });

    const carImages = watch('car_images' as any) || initialImages || [];
    const images = carImages.map((img: any) => typeof img === 'string' ? img : img.url);

    const onInvalid = (errors: any) => {
        console.error('Validation Errors:', errors);
        setFormError('Please check the form for errors. Some required fields might be missing or invalid.');
    };

    const onSubmit = async (data: Car) => {
        setIsSubmitting(true);
        setFormError(null);
        try {
            const result = await saveCar(data as any);
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
        <form onSubmit={handleSubmit(onSubmit as any, onInvalid)} className={styles.form}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={styles.backBtn}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className={styles.title}>
                        {initialData ? `Edit ${initialData.brand} ${initialData.model}` : 'Add New Car'}
                    </h1>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                >
                    {isSubmitting ? <Loader2 className={styles.spinner} /> : <Save size={18} className="me-2" />}
                    Save Car
                </button>
            </header>

            <div className={styles.tabs}>
                <button
                    type="button"
                    className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <FileText size={18} /> General Info
                </button>
                <button
                    type="button"
                    className={`${styles.tab} ${activeTab === 'specs' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('specs')}
                >
                    <Settings size={18} /> Technical Specs
                </button>
                <button
                    type="button"
                    className={`${styles.tab} ${activeTab === 'images' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('images')}
                >
                    <ImageIcon size={18} /> Images
                </button>
            </div>

            <div className={styles.content}>
                {(formError || Object.keys(errors).length > 0) && (
                    <div className={styles.formError}>
                        <AlertCircle size={20} />
                        <span>{formError || 'There are errors in the form. Please check all tabs.'}</span>
                        {formError && (
                            <button
                                type="button"
                                className={styles.dismissBtn}
                                onClick={() => setFormError(null)}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}

                {activeTab === 'general' && (
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Brand</label>
                            <input {...register('brand')} placeholder="e.g. Audi" />
                            {errors.brand && <span className={styles.error}>{errors.brand.message}</span>}
                        </div>
                        <div className={styles.field}>
                            <label>Model</label>
                            <input {...register('model')} placeholder="e.g. A6 Allroad" />
                            {errors.model && <span className={styles.error}>{errors.model.message}</span>}
                        </div>
                        <div className={styles.field}>
                            <label>URL Slug</label>
                            <input {...register('slug')} placeholder="unique-car-slug" />
                            {errors.slug && <span className={styles.error}>{errors.slug.message}</span>}
                        </div>
                        <div className={styles.field}>
                            <label>Price (€)</label>
                            <input type="number" {...register('price', { valueAsNumber: true })} />
                            {errors.price && <span className={styles.error}>{errors.price.message}</span>}
                        </div>
                        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                            <label>Description</label>
                            <div className={styles.descTabs}>
                                <button
                                    type="button"
                                    className={`${styles.descTabBtn} ${descLang === 'ro' ? styles.descTabActive : ''}`}
                                    onClick={() => setDescLang('ro')}
                                >
                                    RO
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.descTabBtn} ${descLang === 'ru' ? styles.descTabActive : ''}`}
                                    onClick={() => setDescLang('ru')}
                                >
                                    RU
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.descTabBtn} ${descLang === 'en' ? styles.descTabActive : ''}`}
                                    onClick={() => setDescLang('en')}
                                >
                                    EN
                                </button>
                            </div>

                            {descLang === 'ro' && (
                                <textarea
                                    {...register('description.ro' as any)}
                                    placeholder="Descriere detaliată (RO)..."
                                    rows={8}
                                />
                            )}
                            {descLang === 'ru' && (
                                <textarea
                                    {...register('description.ru' as any)}
                                    placeholder="Подробное описание (RU)..."
                                    rows={8}
                                />
                            )}
                            {descLang === 'en' && (
                                <textarea
                                    {...register('description.en' as any)}
                                    placeholder="Detailed description (EN)..."
                                    rows={8}
                                />
                            )}
                        </div>
                        <div className={styles.field}>
                            <div className={styles.checkbox}>
                                <input type="checkbox" {...register('is_available')} id="is_available" />
                                <label htmlFor="is_available">Available for sale</label>
                            </div>
                        </div>
                        <div className={styles.field}>
                            <div className={styles.checkbox}>
                                <input type="checkbox" {...register('is_featured')} id="is_featured" />
                                <label htmlFor="is_featured">Featured on homepage</label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'specs' && (
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Year</label>
                            <input type="number" {...register('year', { valueAsNumber: true })} />
                        </div>
                        <div className={styles.field}>
                            <label>Mileage (km)</label>
                            <input type="number" {...register('mileage', { valueAsNumber: true })} />
                        </div>
                        <div className={styles.field}>
                            <label>Fuel Type</label>
                            <select {...register('fuel_type')}>
                                <option value="diesel">Diesel</option>
                                <option value="petrol">Petrol</option>
                                <option value="hybrid">Hybrid</option>
                                <option value="electric">Electric</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Transmission</label>
                            <select {...register('transmission')}>
                                <option value="automatic">Automatic</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Engine (cm³)</label>
                            <input type="number" {...register('engine_cc', { valueAsNumber: true })} />
                        </div>
                        <div className={styles.field}>
                            <label>Drive</label>
                            <select {...register('drive')}>
                                <option value="4x4">4x4</option>
                                <option value="fwd">FWD</option>
                                <option value="rwd">RWD</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Exterior Color</label>
                            <input {...register('color_exterior')} placeholder="e.g. Silver Metallic" />
                        </div>
                        <div className={styles.field}>
                            <label>Interior Color</label>
                            <input {...register('color_interior')} placeholder="e.g. Black Leather" />
                        </div>
                        <div className={styles.field}>
                            <label>Body Type</label>
                            <input {...register('body_type')} placeholder="e.g. SUV, Sedan" />
                        </div>
                        <div className={styles.field}>
                            <label>Seats</label>
                            <input type="number" {...register('seats', { valueAsNumber: true })} />
                        </div>
                    </div>
                )}

                {activeTab === 'images' && (
                    <div>
                        {images.length > 0 && (
                            <div className={styles.mainImageNotice}>
                                <p><strong>Note on Main Image:</strong> The first image in the list above is automatically used as the main/featured photo for the car card. You can delete and re-upload images to change this order.</p>
                            </div>
                        )}
                        <ImageUploader
                            value={images}
                            onChange={(urls) => {
                                setValue('car_images' as any, urls.map((url, i) => ({ url, is_primary: i === 0 })));
                            }}
                            maxFiles={maxImages}
                        /></div>
                )}
            </div>
        </form>
    );
}
