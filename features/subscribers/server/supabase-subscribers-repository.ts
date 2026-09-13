import 'server-only';
import { createServerSupabaseClient } from '@core/supabase/server-client';
import type { SubscribeOutcome, Subscriber, SubscribersRepository } from '../subscribers.types';

const SUBSCRIBERS_TABLE = 'subscribers';

function throwOnDatabaseError(operation: string, { error }: { error: { message: string } | null }) {
    if (error) {
        throw new Error(`Subscribers repository: ${operation} failed: ${error.message}`, { cause: error });
    }
}

export const supabaseSubscribersRepository: SubscribersRepository = {
    async subscribe(email) {
        const supabase = await createServerSupabaseClient();
        // anon may only write subscribers through subscribe_email(), which also does the
        // existing-row lookup: anon never had SELECT on this table, so a plain .insert() can't
        // tell a duplicate signup from a new one.
        const result = await supabase.rpc('subscribe_email', { p_email: email });
        throwOnDatabaseError('subscribe_email', result);
        return result.data as SubscribeOutcome;
    },

    async list() {
        const supabase = await createServerSupabaseClient();
        const result = await supabase
            .from(SUBSCRIBERS_TABLE)
            .select('*')
            .order('subscribed_at', { ascending: false });

        throwOnDatabaseError('list subscribers', result);
        return (result.data ?? []) as Subscriber[];
    },

    async remove(subscriberId) {
        const supabase = await createServerSupabaseClient();
        throwOnDatabaseError(
            'delete subscriber',
            await supabase.from(SUBSCRIBERS_TABLE).delete().eq('id', subscriberId),
        );
    },

    async setActive(subscriberId, isActive) {
        const supabase = await createServerSupabaseClient();
        throwOnDatabaseError(
            'toggle subscriber status',
            await supabase
                .from(SUBSCRIBERS_TABLE)
                .update({ is_active: isActive, unsubscribed_at: isActive ? null : new Date().toISOString() })
                .eq('id', subscriberId),
        );
    },
};
