import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CarEditForm from '@/components/admin/CarEditForm';
import { getPublicSiteConfig } from '@/lib/settings';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditCarPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    const [carResponse, settings] = await Promise.all([
        supabase.from('cars').select('*, car_images(*)').eq('id', id).single(),
        getPublicSiteConfig()
    ]);

    if (carResponse.error || !carResponse.data) notFound();

    const maxImages = settings?.max_car_images || 25;

    return <CarEditForm initialData={carResponse.data as any} maxImages={maxImages} />;
}
