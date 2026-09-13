// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LeadAlertChannel } from '../notifications.types';
import { buildLeadInquirySubmitted } from '../test-support/lead-inquiry-submitted';
import { createLeadAlertNotifier } from './lead-alert-notifier';

function workingChannel(name: string): LeadAlertChannel & { deliver: ReturnType<typeof vi.fn> } {
    return { name, deliver: vi.fn(async () => {}) };
}

function brokenChannel(name: string, reason: Error): LeadAlertChannel {
    return {
        name,
        deliver: () => {
            throw reason;
        },
    };
}

describe('createLeadAlertNotifier', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delivers the alert through every channel', async () => {
        const telegram = workingChannel('telegram');
        const email = workingChannel('email');
        const inquiry = buildLeadInquirySubmitted();

        const report = await createLeadAlertNotifier({ channels: [telegram, email] }).notifyLeadSubmitted(inquiry);

        expect(telegram.deliver).toHaveBeenCalledWith(inquiry);
        expect(email.deliver).toHaveBeenCalledWith(inquiry);
        expect(report).toEqual({ deliveredChannels: ['telegram', 'email'], failedChannels: [] });
    });

    it('still delivers through healthy channels when one fails, logging only the lead id', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const email = workingChannel('email');
        const inquiry = buildLeadInquirySubmitted();
        const notifier = createLeadAlertNotifier({
            channels: [brokenChannel('telegram', new Error('timeout')), email],
        });

        const report = await notifier.notifyLeadSubmitted(inquiry);

        expect(report).toEqual({ deliveredChannels: ['email'], failedChannels: ['telegram'] });
        const [logMessage] = consoleError.mock.calls[0];
        expect(logMessage).toContain(inquiry.leadId);
        expect(logMessage).not.toContain(inquiry.customerPhone);
    });

    it('reports nothing when no channel is configured', async () => {
        const report = await createLeadAlertNotifier({ channels: [] }).notifyLeadSubmitted(buildLeadInquirySubmitted());

        expect(report).toEqual({ deliveredChannels: [], failedChannels: [] });
    });
});
