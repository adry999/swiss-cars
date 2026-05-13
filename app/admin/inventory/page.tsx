import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getAllCarsPaginated } from '@/lib/supabase/queries';
import CarsTable from './CarsTable';
import styles from './page.module.css';

type Props = {
    searchParams: Promise<{ page?: string }>;
};

export default async function AdminCarsPage({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page || '1', 10);

    const { data: cars, totalCount, totalPages } = await getAllCarsPaginated({
        page,
        limit: 20,
    });

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>All Cars ({totalCount})</h1>
                <Link href="/admin/inventory/new" className="btn btn-primary">
                    <Plus size={18} className="me-2" /> Add New Car
                </Link>
            </div>

            <CarsTable
                cars={cars as any}
                currentPage={page}
                totalPages={totalPages}
            />
        </div>
    );
}
