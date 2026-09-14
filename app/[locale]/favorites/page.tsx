import { listAvailableCars } from '@features/inventory/server';
import { FavoriteCarsPage } from '@features/inventory';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mașini Favorite',
    description: 'Mașinile salvate în lista ta de favorite.',
    // Content is per-visitor localStorage state, not something worth indexing
    // or ranking under a canonical URL.
    robots: { index: false, follow: true },
};

export default async function FavoritesPage() {
    const allCars = await listAvailableCars();
    return <FavoriteCarsPage allCars={allCars} />;
}
