import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PartnerForm from '@/components/admin/PartnerForm';

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: partner, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !partner) notFound();

    return (
        <div style={{ padding: '24px' }}>
            <PartnerForm initialData={partner} />
        </div>
    );
}
