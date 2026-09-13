import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Lead, LeadsRepository } from '../leads.types';

const LEADS_TABLE = 'leads_inquiries';

function throwOnDatabaseError(operation: string, { error }: { error: { message: string } | null }) {
    if (error) {
        throw new Error(`Leads repository: ${operation} failed: ${error.message}`, { cause: error });
    }
}

export const supabaseLeadsRepository: LeadsRepository = {
    async insertInquiry(inquiry) {
        const supabase = await createClient();
        // anon may only write leads through submit_lead(), which re-validates every field for direct RPC callers.
        const insertResult = await supabase.rpc('submit_lead', {
            p_car_id: inquiry.carId,
            p_car_name: inquiry.subject,
            p_name: inquiry.customerName,
            p_phone: inquiry.customerPhone,
            p_email: inquiry.customerEmail,
            p_message: inquiry.message,
            p_preferred_date: inquiry.preferredDate,
            p_form_type: inquiry.formType,
            p_source_url: inquiry.sourceUrl,
        });

        throwOnDatabaseError('submit_lead', insertResult);
        return insertResult.data as string;
    },

    async readInboxPage(page, pageSize) {
        const supabase = await createClient();
        const offset = (page - 1) * pageSize;

        const [countResult, pageResult] = await Promise.all([
            supabase.from(LEADS_TABLE).select('*', { count: 'exact', head: true }),
            supabase
                .from(LEADS_TABLE)
                .select('*')
                .order('is_important', { ascending: false })
                .order('created_at', { ascending: false })
                .range(offset, offset + pageSize - 1),
        ]);

        throwOnDatabaseError('count leads', countResult);
        throwOnDatabaseError('read inbox page', pageResult);

        const totalCount = countResult.count ?? 0;
        return {
            // No generated Database types yet, so rows arrive untyped.
            leads: (pageResult.data ?? []) as Lead[],
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        };
    },

    async countUnread() {
        const supabase = await createClient();
        const unreadResult = await supabase
            .from(LEADS_TABLE)
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);

        throwOnDatabaseError('count unread leads', unreadResult);
        return unreadResult.count ?? 0;
    },

    async setRead(leadId, isRead) {
        const supabase = await createClient();
        throwOnDatabaseError(
            'set read state',
            await supabase.from(LEADS_TABLE).update({ is_read: isRead }).eq('id', leadId),
        );
    },

    async setImportant(leadId, isImportant) {
        const supabase = await createClient();
        throwOnDatabaseError(
            'set importance',
            await supabase.from(LEADS_TABLE).update({ is_important: isImportant }).eq('id', leadId),
        );
    },

    async markAllRead() {
        const supabase = await createClient();
        throwOnDatabaseError(
            'mark all read',
            await supabase.from(LEADS_TABLE).update({ is_read: true }).eq('is_read', false),
        );
    },

    async remove(leadId) {
        const supabase = await createClient();
        throwOnDatabaseError('delete lead', await supabase.from(LEADS_TABLE).delete().eq('id', leadId));
    },
};
