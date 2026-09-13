import type { LeadInquirySubmitted } from '@shared/contracts/domain-events';

export interface LeadAlertChannel {
    readonly name: string;
    deliver(inquiry: LeadInquirySubmitted): Promise<void>;
}

export interface LeadAlertDeliveryReport {
    deliveredChannels: string[];
    failedChannels: string[];
}
