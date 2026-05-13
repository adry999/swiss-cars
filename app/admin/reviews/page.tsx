import { getAllReviewsPaginated } from '@/lib/supabase/queries';
import ReviewsTable from './ReviewsTable';
import styles from './page.module.css';

type Props = {
    searchParams: Promise<{ page?: string }>;
};

export default async function AdminReviewsPage({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page || '1', 10);

    const { data: reviews, totalCount, totalPages } = await getAllReviewsPaginated({
        page,
        limit: 20,
    });

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Customer Reviews ({totalCount})</h1>
                <a href="/admin/reviews/new" className="btn btn-primary">Add Review</a>
            </div>
            <ReviewsTable
                reviews={reviews as any}
                currentPage={page}
                totalPages={totalPages}
            />
        </div>
    );
}
