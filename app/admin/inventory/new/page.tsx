import { CarEditForm } from '@features/inventory/admin';
import { getPublicSiteConfig } from '@/lib/settings';

export default async function NewCarPage() {
    const settings = await getPublicSiteConfig();
    const maxImages = settings?.max_car_images || 25;

    return <CarEditForm maxImages={maxImages} />;
}
