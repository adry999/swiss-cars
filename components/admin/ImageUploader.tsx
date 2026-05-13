'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, X, UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/client';
import styles from './ImageUploader.module.css';

interface Props {
    value: string[];
    onChange: (urls: string[]) => void;
    maxFiles?: number;
}

export default function ImageUploader({ value, onChange, maxFiles = 10 }: Props) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setError(null);
        if (value.length + acceptedFiles.length > maxFiles) {
            setError(`You can only upload up to ${maxFiles} images.`);
            return;
        }

        setUploading(true);
        const newUrls: string[] = [];

        for (const file of acceptedFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `cars/${fileName}`;

            const { data, error } = await supabase.storage
                .from('car-images')
                .upload(filePath, file);

            if (error) {
                console.error('Error uploading image:', error);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('car-images')
                .getPublicUrl(filePath);

            newUrls.push(publicUrl);
        }

        onChange([...value, ...newUrls]);
        setUploading(false);
    }, [value, maxFiles, onChange, supabase]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        disabled: uploading
    });

    const removeImage = (urlToRemove: string) => {
        onChange(value.filter(url => url !== urlToRemove));
    };

    const makePrimary = (index: number) => {
        if (index === 0) return;
        const newUrls = [...value];
        const [movedImage] = newUrls.splice(index, 1);
        newUrls.unshift(movedImage);
        onChange(newUrls);
    };

    return (
        <div className={styles.container}>
            {error && (
                <div className={styles.error}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <button
                        type="button"
                        className={styles.dismissError}
                        onClick={() => setError(null)}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
            <div className={styles.grid}>
                {value.map((url, index) => (
                    <div key={url} className={styles.previewCard}>
                        <Image
                            src={url}
                            alt={`Upload ${index}`}
                            fill
                            className={styles.image}
                        />
                        <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => removeImage(url)}
                            title="Remove image"
                        >
                            <X size={14} />
                        </button>
                        {index === 0 ? (
                            <span className={styles.primaryBadge}>Main Photo</span>
                        ) : (
                            <button
                                type="button"
                                className={styles.makePrimaryBtn}
                                onClick={() => makePrimary(index)}
                                title="Set as main photo"
                            >
                                Set Main
                            </button>
                        )}
                    </div>
                ))}

                {value.length < maxFiles && (
                    <div
                        {...getRootProps()}
                        className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''} ${uploading ? styles.disabled : ''}`}
                    >
                        <input {...getInputProps()} />
                        {uploading ? (
                            <Loader2 className={styles.spinner} />
                        ) : (
                            <>
                                <UploadCloud size={32} className={styles.uploadIcon} />
                                <p>Click or drag images</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
