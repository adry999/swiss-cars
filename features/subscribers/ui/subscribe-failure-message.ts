import type { SubscriptionRejection } from '../subscribers.types';

/** Keys of the `footer` message namespace. */
export type SubscribeFailureMessageKey = 'subscribe_invalid_email' | 'subscribe_already' | 'subscribe_error';

export function subscribeFailureMessageKey(reason: SubscriptionRejection): SubscribeFailureMessageKey {
    switch (reason) {
        case 'invalid-email':
            return 'subscribe_invalid_email';
        case 'already-subscribed':
            return 'subscribe_already';
        case 'unavailable':
            return 'subscribe_error';
    }
}
