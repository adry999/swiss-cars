'use client';

import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { Car } from '@/lib/types';
import ImageUploader from '@/components/admin/ImageUploader';
import styles from '../CarEditForm.module.css';

interface ImagesTabProps {
    watch: UseFormWatch<Car>;
    setValue: UseFormSetValue<Car>;
    maxImages: number;
    initialImages: Array<{ url: string; is_primary: boolean }>;
}

export default function ImagesTab({ watch, setValue, maxImages, initialImages }: ImagesTabProps) {
    const carImages = watch('car_images' as any) || initialImages || [];
    const images = carImages.map((img: any) => typeof img === 'string' ? img : img.url);

    return (
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
            />
        </div>
    );
}
