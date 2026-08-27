import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CarEditForm from '@/components/admin/CarEditForm';
import { getPublicSiteConfig } from '@/lib/settings';
import type { Car } from '@/lib/types';

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

    // The Supabase client here isn't wired to generated Database types, so
    // .select() returns an untyped row — matches the cast convention already
    // used throughout lib/supabase/queries.ts.
    return <CarEditForm initialData={carResponse.data as Car} maxImages={maxImages} />;
}
