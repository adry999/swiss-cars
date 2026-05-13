import { getCars } from '@/lib/supabase/queries';
import FavoritesPageClient from '@/components/cars/FavoritesPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mașini Favorite | SwissCars.md',
    description: 'Mașinile salvate în lista ta de favorite.',
};

export default async function FavoritesPage() {
    const allCars = await getCars();
    return <FavoritesPageClient allCars={allCars} />;
}
