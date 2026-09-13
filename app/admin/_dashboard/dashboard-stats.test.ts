// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { composeDashboardStats } from './dashboard-stats';

describe('composeDashboardStats', () => {
    it('derives sold cars from total minus available and passes counts through', () => {
        const stats = composeDashboardStats({
            cars: { total: 12, available: 5 },
            leads: { total: 30, unread: 4 },
            reviewCount: 8,
            partnerCount: 6,
        });

        expect(stats).toEqual({
            totalCars: 12,
            availableCars: 5,
            soldCars: 7,
            totalLeads: 30,
            unreadLeads: 4,
            totalReviews: 8,
            totalPartners: 6,
        });
    });

    it('treats every car as sold when none are available', () => {
        const stats = composeDashboardStats({
            cars: { total: 3, available: 0 },
            leads: { total: 0, unread: 0 },
            reviewCount: 0,
            partnerCount: 0,
        });

        expect(stats.soldCars).toBe(3);
    });
});
