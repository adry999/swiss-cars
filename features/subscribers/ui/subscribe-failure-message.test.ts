import { describe, expect, it } from 'vitest';
import { subscribeFailureMessageKey } from './subscribe-failure-message';

describe('subscribeFailureMessageKey', () => {
    it('maps an invalid email to its message key', () => {
        expect(subscribeFailureMessageKey('invalid-email')).toBe('subscribe_invalid_email');
    });

    it('maps an already-subscribed rejection to its message key', () => {
        expect(subscribeFailureMessageKey('already-subscribed')).toBe('subscribe_already');
    });

    it('maps an unavailable server to the generic subscribe error', () => {
        expect(subscribeFailureMessageKey('unavailable')).toBe('subscribe_error');
    });
});
