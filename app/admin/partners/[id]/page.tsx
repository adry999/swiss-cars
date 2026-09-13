import { notFound } from 'next/navigation';
import { findPartnerForEditing } from '@features/partners/server';
import { PartnerForm } from '@features/partners/admin';

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const partner = await findPartnerForEditing(id);

    if (!partner) notFound();

    return (
        <div style={{ padding: '24px' }}>
            <PartnerForm initialData={partner} />
        </div>
    );
}
