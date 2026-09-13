import Link from 'next/link';
import { Plus } from 'lucide-react';
import { readCatalogPage } from '@features/inventory/server';
import { InventoryTable } from '@features/inventory/admin';
import styles from './page.module.css';

type Props = {
    searchParams: Promise<{ page?: string }>;
};

export default async function AdminCarsPage({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page || '1', 10);

    const { data: cars, totalCount, totalPages } = await readCatalogPage({
        page,
        limit: 20,
        availableOnly: false,
    });

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Vehicles<span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: '8px' }}>({totalCount})</span></h1>
                <Link href="/admin/inventory/new" className="btn btn-primary">
                    <Plus size={16} className="me-2" /> New
                </Link>
            </div>

            <InventoryTable
                cars={cars}
                currentPage={page}
                totalPages={totalPages}
            />
        </div>
    );
}
