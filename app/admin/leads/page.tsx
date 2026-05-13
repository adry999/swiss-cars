import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import LeadsTable from './LeadsTable';
import LeadsPagination from './LeadsPagination';
import styles from './page.module.css';

const ITEMS_PER_PAGE = 20;

async function getLeadsPaginated(page: number) {
    const supabase = await createClient();
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const [countResult, dataResult] = await Promise.all([
        supabase.from('leads_inquiries').select('*', { count: 'exact', head: true }),
        supabase
            .from('leads_inquiries')
            .select('*')
            .order('is_important', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + ITEMS_PER_PAGE - 1),
    ]);

    const totalCount = countResult.count || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return {
        data: dataResult.data || [],
        totalCount,
        totalPages,
    };
}

async function getUnreadCount() {
    const supabase = await createClient();
    const { count } = await supabase
        .from('leads_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
    return count || 0;
}

type Props = {
    searchParams: Promise<{ page?: string }>;
};

export default async function LeadsPage({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page || '1', 10);

    const [{ data: leads, totalCount, totalPages }, unread] = await Promise.all([
        getLeadsPaginated(page),
        getUnreadCount(),
    ]);

    return (
        <div className={styles.page}>
            <Suspense>
                <LeadsTable initialLeads={leads as any} unreadCount={unread} />
                <LeadsPagination currentPage={page} totalPages={totalPages} />
            </Suspense>
        </div>
    );
}
