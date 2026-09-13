'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useOptionalToast } from '@/components/ui/Toast';
import { subscribe } from '../actions';
import { subscribeFailureMessageKey } from './subscribe-failure-message';
import styles from './NewsletterSignupForm.module.css';

type SubmissionState = 'idle' | 'submitting' | 'succeeded' | 'failed';

export default function NewsletterSignupForm() {
    const t = useTranslations('footer');
    const [email, setEmail] = useState('');
    const [state, setState] = useState<SubmissionState>('idle');
    // A ref rather than state: a second click can land before React re-renders the disabled button.
    const submissionInFlight = useRef(false);

    // Toast might not be available if the form is rendered outside ToastProvider.
    const toast = useOptionalToast();

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!email.trim() || submissionInFlight.current) return;

            submissionInFlight.current = true;
            setState('submitting');

            try {
                const result = await subscribe(email);
                if (result.status === 'succeeded') {
                    setState('succeeded');
                    setEmail('');
                    toast?.success(t('subscribe_success'));
                } else {
                    setState('failed');
                    toast?.error(t(subscribeFailureMessageKey(result.reason)));
                }
            } catch {
                setState('failed');
                toast?.error(t('subscribe_error'));
            } finally {
                submissionInFlight.current = false;
            }
        },
        [email, t, toast],
    );

    return (
        <form className={styles.subscribeForm} onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder={t('subscribe_placeholder')}
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <button type="submit" className="btn btn-primary" disabled={state === 'submitting'}>
                {state === 'submitting' ? '...' : t('subscribe_btn')}
            </button>
        </form>
    );
}
