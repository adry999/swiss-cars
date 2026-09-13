import 'server-only';
import { after } from 'next/server';
import { Redis } from '@upstash/redis';
import { getServerEnvironment } from '@config/server-environment';
import { createEventBus } from '@core/events/event-bus';
import { createRateLimiter } from '@core/rate-limit/rate-limiter';
import { createUpstashWindowUsageStore } from '@core/rate-limit/upstash-window-usage-store';
import type { DomainEvents } from '@shared/contracts/domain-events';
import { createSubmitLeadInquiry, supabaseLeadsRepository, type SubmitLeadInquiry } from '@features/leads/server';
import {
    createLeadAlertNotifier,
    createResendLeadAlertChannel,
    createTelegramLeadAlertChannel,
    type LeadAlertChannel,
} from '@features/notifications';
import { getNotificationConfig } from '@features/site-settings/server';

async function resolveLeadAlertChannels(): Promise<LeadAlertChannel[]> {
    const { telegramBotToken, telegramChatId, notificationEmail } = await getNotificationConfig();
    const { resendApiKey } = getServerEnvironment();
    const channels: LeadAlertChannel[] = [];

    if (telegramBotToken && telegramChatId) {
        channels.push(createTelegramLeadAlertChannel({ botToken: telegramBotToken, chatId: telegramChatId }));
    }
    if (resendApiKey && notificationEmail) {
        channels.push(createResendLeadAlertChannel({ apiKey: resendApiKey, recipient: notificationEmail }));
    }

    return channels;
}

function composeSubmitLeadInquiry(): SubmitLeadInquiry {
    const { upstashRedis } = getServerEnvironment();
    const eventBus = createEventBus<DomainEvents>();

    eventBus.subscribe('leads.inquiry-submitted', (inquiry) => {
        // Alerts run after the response is sent; on Vercel `after` keeps the function alive until they settle.
        after(async () => {
            const notifier = createLeadAlertNotifier({ channels: await resolveLeadAlertChannels() });
            await notifier.notifyLeadSubmitted(inquiry);
        });
    });

    const rateLimitStore = upstashRedis
        ? createUpstashWindowUsageStore(new Redis({ url: upstashRedis.restUrl, token: upstashRedis.restToken }))
        : null;

    return createSubmitLeadInquiry({
        leadsRepository: supabaseLeadsRepository,
        rateLimiter: createRateLimiter({ store: rateLimitStore }),
        eventPublisher: eventBus,
    });
}

let submitLeadInquiry: SubmitLeadInquiry | undefined;

/** Composed on first use, so builds and prerendered pages never need runtime secrets. */
export function getSubmitLeadInquiry(): SubmitLeadInquiry {
    submitLeadInquiry ??= composeSubmitLeadInquiry();
    return submitLeadInquiry;
}
