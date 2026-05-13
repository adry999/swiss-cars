'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';

type Props = {
    currentPage: number;
    totalPages: number;
};

export default function LeadsPagination({ currentPage, totalPages }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
        />
    );
}
