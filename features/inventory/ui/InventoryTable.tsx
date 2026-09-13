'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Trash2, Eye, Copy, Loader2 } from 'lucide-react';
import DataTable from '@shared/ui/admin/DataTable';
import Pagination from '@shared/ui/Pagination';
import { formatPrice } from '@shared/formatting/format';
import { useState } from 'react';
import Image from 'next/image';
import type { Car } from '../inventory.types';
import { deleteCar, duplicateCar } from '../actions';
import styles from './InventoryTable.module.css';

type Props = {
    cars: Car[];
    currentPage: number;
    totalPages: number;
};

export default function InventoryTable({ cars, currentPage, totalPages }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

    const changePage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`?${params.toString()}`);
    };

    const removeCar = async (id: string) => {
        if (!confirm('Ești sigur că vrei să ștergi această mașină?')) return;
        const result = await deleteCar(id);
        if (result.status === 'succeeded') {
            router.refresh();
        } else {
            alert('Ștergerea a eșuat');
        }
    };

    const duplicateCarRow = async (id: string) => {
        if (!confirm('Vrei să creezi o copie a acestei mașini?')) return;
        setIsDuplicating(id);
        const result = await duplicateCar(id);
        if (result.status === 'succeeded') {
            router.refresh();
        } else {
            alert('Duplicarea a eșuat');
        }
        setIsDuplicating(null);
    };

    const columns = [
        {
            header: '',
            accessor: (car: Car) => {
                const primaryImage = car.car_images?.find((img) => img.is_primary) || car.car_images?.[0];
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
                            <div className={styles.noImage}>—</div>
                        )}
                    </div>
                );
            },
            width: '80px'
        },
        {
            header: 'Vehicle',
            accessor: (car: Car) => (
                <div className={styles.carInfo}>
                    <span className={styles.carName}>{car.brand} {car.model}</span>
                    <span className={styles.carSlug}>{car.slug}</span>
                </div>
            )
        },
        { header: 'Year', accessor: (car: Car) => car.year, width: '80px' },
        {
            header: 'Price',
            accessor: (car: Car) => <code style={{ fontSize: '12px' }}>{formatPrice(car.price)} €</code>,
            width: '120px'
        },
        {
            header: 'Status',
            accessor: (car: Car) => (
                <span className={car.is_available ? 'badge-success' : 'badge-error'}>
                    {car.is_available ? 'Active' : 'Sold'}
                </span>
            ),
            width: '100px'
        },
    ];

    return (
        <>
            <DataTable
                data={cars}
                columns={columns}
                actions={(car: Car) => (
                    <div className={styles.actions}>
                        <Link href={`/inventory/${car.slug}`} target="_blank" className="action-btn" title="Vezi pe site">
                            <Eye size={16} />
                        </Link>
                        <Link href={`/admin/inventory/${car.id}`} className="action-btn" title="Editează">
                            <Edit2 size={16} />
                        </Link>
                        <button
                            className="action-btn"
                            onClick={() => duplicateCarRow(car.id!)}
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
                            className="action-btn action-btn-delete"
                            onClick={() => removeCar(car.id!)}
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
                onPageChange={changePage}
            />
        </>
    );
}
