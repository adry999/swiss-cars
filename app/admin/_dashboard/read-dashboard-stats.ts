import 'server-only';
import { countCars } from '@features/inventory/server';
import { supabaseLeadsRepository } from '@features/leads/server';
import { countReviews } from '@features/reviews/server';
import { countPartners } from '@features/partners/server';
import { composeDashboardStats, type DashboardStats } from './dashboard-stats';

export async function readDashboardStats(): Promise<DashboardStats> {
    const [cars, leads, reviewCount, partnerCount] = await Promise.all([
        countCars(),
        supabaseLeadsRepository.countLeads(),
        countReviews(),
        countPartners(),
    ]);

    return composeDashboardStats({ cars, leads, reviewCount, partnerCount });
}
