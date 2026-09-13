import type { LeadInquirySubmitted } from '@shared/contracts/domain-events';
import type { LeadAlertChannel, LeadAlertDeliveryReport } from '../notifications.types';

export interface LeadAlertNotifier {
    notifyLeadSubmitted(inquiry: LeadInquirySubmitted): Promise<LeadAlertDeliveryReport>;
}

/**
 * Fans an alert out to every channel. The lead is already stored when this runs,
 * so a failing channel is reported and logged, never thrown.
 */
export function createLeadAlertNotifier({ channels }: { channels: readonly LeadAlertChannel[] }): LeadAlertNotifier {
    return {
        async notifyLeadSubmitted(inquiry) {
            const outcomes = await Promise.allSettled(channels.map(async (channel) => channel.deliver(inquiry)));
            const report: LeadAlertDeliveryReport = { deliveredChannels: [], failedChannels: [] };

            outcomes.forEach((outcome, index) => {
                const channelName = channels[index].name;
                if (outcome.status === 'fulfilled') {
                    report.deliveredChannels.push(channelName);
                    return;
                }

                // Only the lead id is logged: the alert itself carries the customer's contact details.
                console.error(`Lead alert ${inquiry.leadId} via ${channelName} failed:`, outcome.reason);
                report.failedChannels.push(channelName);
            });

            return report;
        },
    };
}
