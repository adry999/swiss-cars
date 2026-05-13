import CarEditForm from '@/components/admin/CarEditForm';
import { getSettings } from '@/lib/actions/settings';

export default async function NewCarPage() {
    const settings = await getSettings('site_config');
    const maxImages = settings?.max_car_images || 25;

    return <CarEditForm maxImages={maxImages} />;
}
