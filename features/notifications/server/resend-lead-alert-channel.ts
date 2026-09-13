import { formatEmailLeadAlert } from '../model/lead-alert-message';
import type { LeadAlertChannel } from '../notifications.types';

const DEFAULT_SENDER = 'SwissCars Notifications <notifications@swisscars.md>';

export interface ResendLeadAlertChannelOptions {
    apiKey: string;
    recipient: string;
    sender?: string;
    fetchImpl?: typeof fetch;
}

export function createResendLeadAlertChannel({
    apiKey,
    recipient,
    sender = DEFAULT_SENDER,
    fetchImpl = fetch,
}: ResendLeadAlertChannelOptions): LeadAlertChannel {
    return {
        name: 'email',

        async deliver(inquiry) {
            const { subject, html } = formatEmailLeadAlert(inquiry);
            const response = await fetchImpl('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ from: sender, to: [recipient], subject, html }),
            });

            if (!response.ok) {
                throw new Error(`Resend rejected the lead alert (${response.status}): ${await response.text()}`);
            }
        },
    };
}
