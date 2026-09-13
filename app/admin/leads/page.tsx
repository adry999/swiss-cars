import { Suspense } from 'react';
import { LeadInbox } from '@features/leads/admin';
import { markLeadRead, markLeadImportant, deleteLead, markAllLeadsRead } from '@features/leads/actions';
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

    const { leads, totalPages } = await supabaseLeadsRepository.readInboxPage(page, LEADS_PER_PAGE);

    return (
        <div className={styles.page}>
            <Suspense>
                <LeadInbox
                    initialLeads={leads}
                    inboxActions={{ markLeadRead, markLeadImportant, deleteLead, markAllLeadsRead }}
                />
                <LeadsPagination currentPage={page} totalPages={totalPages} />
            </Suspense>
        </div>
    );
}
