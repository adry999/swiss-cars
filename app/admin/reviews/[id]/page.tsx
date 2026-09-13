import { notFound } from 'next/navigation';
import { findReviewForEditing } from '@features/reviews/server';
import { ReviewForm } from '@features/reviews/admin';

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const review = await findReviewForEditing(id);

    if (!review) notFound();

    return (
        <div style={{ padding: '24px' }}>
            <ReviewForm initialData={review} />
        </div>
    );
}
