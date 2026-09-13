import { Suspense } from 'react';
import LeadsTable from './LeadsTable';
import LeadsPagination from './LeadsPagination';
import { supabaseLeadsRepository } from '@features/leads/server';
import styles from './page.module.css';

const LEADS_PER_PAGE = 20;

type Props = {
    searchParams: Promise<{ page?: string }>;
};

export default async function LeadsPage({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    // Guard against ?page=abc / negative values reaching .range(NaN, NaN).
    const page = Math.max(1, Number.parseInt(resolvedParams.page ?? '1', 10) || 1);

    const [{ leads, totalPages }, unread] = await Promise.all([
        supabaseLeadsRepository.readInboxPage(page, LEADS_PER_PAGE),
        supabaseLeadsRepository.countUnread(),
    ]);

    return (
        <div className={styles.page}>
            <Suspense>
                <LeadsTable initialLeads={leads} unreadCount={unread} />
                <LeadsPagination currentPage={page} totalPages={totalPages} />
            </Suspense>
        </div>
    );
}
