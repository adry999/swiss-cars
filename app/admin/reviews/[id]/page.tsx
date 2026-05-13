import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReviewForm from '@/components/admin/ReviewForm';

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: review, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !review) notFound();

    return (
        <div style={{ padding: '24px' }}>
            <ReviewForm initialData={review} />
        </div>
    );
}
