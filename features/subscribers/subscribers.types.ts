import type { ActionResult } from '@shared/contracts/action-result';

/** A `subscribers` row as the admin table reads it. */
export interface Subscriber {
    id: string;
    email: string;
    is_active: boolean;
    subscribed_at: string;
    unsubscribed_at: string | null;
}

export type SubscribeOutcome = 'subscribed' | 'resubscribed' | 'already_subscribed';

export type SubscriptionRejection = 'invalid-email' | 'already-subscribed' | 'unavailable';
export type SubscriptionResult = ActionResult<SubscriptionRejection>;
export type SubscriberChangeResult = ActionResult<'invalid-input' | 'unavailable'>;

export interface SubscribersRepository {
    subscribe(email: string): Promise<SubscribeOutcome>;
    list(): Promise<Subscriber[]>;
    remove(subscriberId: string): Promise<void>;
    setActive(subscriberId: string, isActive: boolean): Promise<void>;
}
