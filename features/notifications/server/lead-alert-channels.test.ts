// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { buildLeadInquirySubmitted } from '../test-support/lead-inquiry-submitted';
import { createResendLeadAlertChannel } from './resend-lead-alert-channel';
import { createTelegramLeadAlertChannel } from './telegram-lead-alert-channel';

function respondWith(status: number, body = '') {
    return vi.fn<typeof fetch>(async () => new Response(body, { status }));
}

function sentRequest(fetchImpl: ReturnType<typeof respondWith>) {
    const [url, init] = fetchImpl.mock.calls[0];
    return { url: String(url), init: init as RequestInit, body: JSON.parse(String(init?.body)) };
}

describe('createTelegramLeadAlertChannel', () => {
    it('sends the alert to the configured chat as MarkdownV2', async () => {
        const fetchImpl = respondWith(200);
        const channel = createTelegramLeadAlertChannel({ botToken: 'bot-token', chatId: '-100200300', fetchImpl });

        await channel.deliver(buildLeadInquirySubmitted());

        const request = sentRequest(fetchImpl);
        expect(request.url).toBe('https://api.telegram.org/botbot-token/sendMessage');
        expect(request.body).toMatchObject({ chat_id: '-100200300', parse_mode: 'MarkdownV2' });
        expect(request.body.text).toContain('Ion Popescu');
    });

    it('fails with the response status and without exposing the bot token', async () => {
        const channel = createTelegramLeadAlertChannel({
            botToken: 'bot-token',
            chatId: '-100200300',
            fetchImpl: respondWith(400, "Bad Request: can't parse entities"),
        });

        const delivery = channel.deliver(buildLeadInquirySubmitted());

        await expect(delivery).rejects.toThrow("Telegram rejected the lead alert (400): Bad Request: can't parse entities");
        await expect(delivery).rejects.not.toThrow(/bot-token/);
    });
});

describe('createResendLeadAlertChannel', () => {
    it('emails the alert to the recipient with the API key', async () => {
        const fetchImpl = respondWith(200);
        const channel = createResendLeadAlertChannel({ apiKey: 're_key', recipient: 'sales@swisscars.md', fetchImpl });

        await channel.deliver(buildLeadInquirySubmitted());

        const request = sentRequest(fetchImpl);
        expect(request.url).toBe('https://api.resend.com/emails');
        expect(new Headers(request.init.headers).get('Authorization')).toBe('Bearer re_key');
        expect(request.body).toMatchObject({ to: ['sales@swisscars.md'], subject: 'Lead nou: Ion Popescu - BMW X5 2020' });
    });

    it('fails with the response status when Resend refuses the email', async () => {
        const channel = createResendLeadAlertChannel({
            apiKey: 're_key',
            recipient: 'sales@swisscars.md',
            fetchImpl: respondWith(422, 'invalid from address'),
        });

        await expect(channel.deliver(buildLeadInquirySubmitted())).rejects.toThrow(
            'Resend rejected the lead alert (422): invalid from address',
        );
    });
});
