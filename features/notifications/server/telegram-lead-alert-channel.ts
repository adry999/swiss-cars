import { formatTelegramLeadAlert } from '../model/lead-alert-message';
import type { LeadAlertChannel } from '../notifications.types';

export interface TelegramLeadAlertChannelOptions {
    botToken: string;
    chatId: string;
    fetchImpl?: typeof fetch;
}

export function createTelegramLeadAlertChannel({
    botToken,
    chatId,
    fetchImpl = fetch,
}: TelegramLeadAlertChannelOptions): LeadAlertChannel {
    return {
        name: 'telegram',

        async deliver(inquiry) {
            const response = await fetchImpl(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: formatTelegramLeadAlert(inquiry),
                    parse_mode: 'MarkdownV2',
                }),
            });

            // The request URL embeds the bot token, so the error never includes it.
            if (!response.ok) {
                throw new Error(`Telegram rejected the lead alert (${response.status}): ${await response.text()}`);
            }
        },
    };
}
