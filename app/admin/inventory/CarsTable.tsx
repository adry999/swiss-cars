'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Trash2, Eye, Copy, Loader2 } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/ui/Pagination';
import styles from './page.module.css';
import { type Car } from '@/lib/types';
import { deleteCar, duplicateCar } from '@/lib/actions/cars';
import { formatPrice } from '@/lib/utils/format';
import { useState } from 'react';
import Image from 'next/image';

type Props = {
    cars: Car[];
    currentPage: number;
    totalPages: number;
};

export default function CarsTable({ cars, currentPage, totalPages }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`?${params.toString()}`);
    };

    const onDelete = async (id: string) => {
        if (!confirm('Ești sigur că vrei să ștergi această mașină?')) return;
        try {
            await deleteCar(id);
            router.refresh();
        } catch (error) {
            alert('Ștergerea a eșuat');
        }
    };

    const onDuplicate = async (id: string) => {
        if (!confirm('Vrei să creezi o copie a acestei mașini?')) return;
        setIsDuplicating(id);
        try {
            const res = await duplicateCar(id);
            if (res.success) {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert('Duplicarea a eșuat');
        } finally {
            setIsDuplicating(null);
        }
    };

    const columns = [
        {
            header: '',
            accessor: (car: Car) => {
                const primaryImage = car.car_images?.find((img: any) => img.is_primary) || car.car_images?.[0];
                return (
                    <div className={styles.thumbnailWrapper}>
                        {primaryImage ? (
                            <Image
                                src={primaryImage.url}
                                alt={`${car.brand} ${car.model}`}
                                width={60}
                                height={40}
                                className={styles.thumbnail}
                                quality={20}
                            />
                        ) : (
                            <div className={styles.noImage}>No image</div>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Mașină',
            accessor: (car: Car) => (
                <div className={styles.carInfo}>
                    <span className={styles.carName}>{car.brand} {car.model}</span>
                    <span className={styles.carSlug}>{car.slug}</span>
                </div>
            )
        },
        { header: 'An', accessor: (car: Car) => car.year },
        {
            header: 'Preț',
            accessor: (car: Car) => `${formatPrice(car.price)} €`
        },
        {
            header: 'Status',
            accessor: (car: Car) => (
                <span className={car.is_available ? styles.badgeSuccess : styles.badgeError}>
                    {car.is_available ? 'Disponibil' : 'Vândut'}
                </span>
            )
        },
    ];

    return (
        <>
            <DataTable
                data={cars}
                columns={columns as any}
                actions={(car: Car) => (
                    <div className={styles.actions}>
                        <Link href={`/inventory/${car.slug}`} target="_blank" className={styles.actionBtn} title="Vezi pe site">
                            <Eye size={16} />
                        </Link>
                        <Link href={`/admin/inventory/${car.id}`} className={styles.actionBtn} title="Editează">
                            <Edit2 size={16} />
                        </Link>
                        <button
                            className={styles.actionBtn}
                            onClick={() => onDuplicate(car.id!)}
                            disabled={!!isDuplicating}
                            title="Duplică (Creează o copie)"
                        >
                            {isDuplicating === car.id ? (
                                <Loader2 size={16} className={styles.spinner} />
                            ) : (
                                <Copy size={16} />
                            )}
                        </button>
                        <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => onDelete(car.id!)}
                            title="Șterge"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </>
    );
}
