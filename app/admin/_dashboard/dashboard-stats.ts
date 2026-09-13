export interface DashboardStats {
    totalCars: number;
    availableCars: number;
    soldCars: number;
    totalLeads: number;
    unreadLeads: number;
    totalReviews: number;
    totalPartners: number;
}

interface DashboardCounts {
    cars: { total: number; available: number };
    leads: { total: number; unread: number };
    reviewCount: number;
    partnerCount: number;
}

export function composeDashboardStats({ cars, leads, reviewCount, partnerCount }: DashboardCounts): DashboardStats {
    return {
        totalCars: cars.total,
        availableCars: cars.available,
        soldCars: cars.total - cars.available,
        totalLeads: leads.total,
        unreadLeads: leads.unread,
        totalReviews: reviewCount,
        totalPartners: partnerCount,
    };
}
