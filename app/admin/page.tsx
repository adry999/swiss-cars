import { Car, MessageSquare, Users, Inbox, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { getDashboardStats, getRecentLeads } from '@/lib/supabase/queries';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import styles from './page.module.css';

export default async function AdminDashboard() {
    const stats = await getDashboardStats();
    const recentLeads = await getRecentLeads(5);

    const statCards = [
        {
            label: 'Total Cars',
            value: stats.totalCars.toString(),
            icon: Car,
            color: '#e71a1c',
            href: '/admin/inventory'
        },
        {
            label: 'Available',
            value: stats.availableCars.toString(),
            icon: CheckCircle,
            color: '#2ecc71',
            href: '/admin/inventory'
        },
        {
            label: 'New Leads',
            value: stats.unreadLeads.toString(),
            icon: Inbox,
            color: stats.unreadLeads > 0 ? '#e74c3c' : '#95a5a6',
            href: '/admin/leads'
        },
        {
            label: 'Total Leads',
            value: stats.totalLeads.toString(),
            icon: TrendingUp,
            color: '#3498db',
            href: '/admin/leads'
        },
        {
            label: 'Reviews',
            value: stats.totalReviews.toString(),
            icon: MessageSquare,
            color: '#9b59b6',
            href: '/admin/reviews'
        },
        {
            label: 'Partners',
            value: stats.totalPartners.toString(),
            icon: Users,
            color: '#f1c40f',
            href: '/admin/partners'
        },
    ];

    return (
        <div>
            <h1 className={styles.title}>Dashboard Overview</h1>

            <div className={styles.statsGrid}>
                {statCards.map((stat) => (
                    <Link key={stat.label} href={stat.href} className={styles.statCard}>
                        <div
                            className={styles.iconWrapper}
                            style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                        >
                            <stat.icon size={24} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>{stat.label}</span>
                            <span className={styles.statValue}>{stat.value}</span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className={styles.sections}>
                {/* Recent Leads */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Recent Leads</h2>
                        <Link href="/admin/leads" className={styles.viewAll}>View All</Link>
                    </div>

                    {recentLeads.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Inbox size={32} />
                            <p>No leads yet</p>
                        </div>
                    ) : (
                        <div className={styles.leadsList}>
                            {recentLeads.map((lead: any) => (
                                <div key={lead.id} className={styles.leadItem}>
                                    <div className={styles.leadInfo}>
                                        <span className={styles.leadName}>{lead.name}</span>
                                        <span className={styles.leadCar}>{lead.car_name || 'General Inquiry'}</span>
                                    </div>
                                    <div className={styles.leadMeta}>
                                        <span className={styles.leadPhone}>{lead.phone}</span>
                                        <span className={styles.leadTime}>
                                            <Clock size={12} />
                                            {lead.created_at
                                                ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })
                                                : 'Recently'
                                            }
                                        </span>
                                    </div>
                                    {!lead.is_read && <span className={styles.newBadge}>New</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Quick Actions</h2>
                    </div>
                    <div className={styles.quickActions}>
                        <Link href="/admin/inventory/new" className={styles.actionButton}>
                            <Car size={20} />
                            Add New Car
                        </Link>
                        <Link href="/admin/reviews/new" className={styles.actionButton}>
                            <MessageSquare size={20} />
                            Add Review
                        </Link>
                        <Link href="/admin/partners/new" className={styles.actionButton}>
                            <Users size={20} />
                            Add Partner
                        </Link>
                        <Link href="/" target="_blank" className={styles.actionButtonOutline}>
                            View Website
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
