import { notFound } from 'next/navigation';
import { findCarForEditing } from '@features/inventory/server';
import { CarEditForm } from '@features/inventory/admin';
import { getPublicSiteConfig } from '@/lib/settings';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditCarPage({ params }: Props) {
    const { id } = await params;

    const [car, settings] = await Promise.all([
        findCarForEditing(id),
        getPublicSiteConfig()
    ]);

    if (!car) notFound();

    const maxImages = settings?.max_car_images || 25;

    return <CarEditForm initialData={car} maxImages={maxImages} />;
}
