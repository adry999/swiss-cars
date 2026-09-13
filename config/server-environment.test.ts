import { describe, expect, it } from 'vitest';
import { parseServerEnvironment } from './server-environment';

describe('parseServerEnvironment', () => {
    it('disables every optional integration when nothing is configured', () => {
        expect(parseServerEnvironment({})).toEqual({
            upstashRedis: null,
            telegram: null,
            resendApiKey: null,
            notificationEmail: null,
        });
    });

    it('enables integrations whose credentials are complete', () => {
        const environment = parseServerEnvironment({
            UPSTASH_REDIS_REST_URL: 'https://eu1-redis.upstash.io',
            UPSTASH_REDIS_REST_TOKEN: 'redis-token',
            TELEGRAM_BOT_TOKEN: 'bot-token',
            TELEGRAM_CHAT_ID: '-100200300',
            NOTIFICATION_EMAIL: 'sales@swisscars.md',
            RESEND_API_KEY: 're_key',
        });

        expect(environment.upstashRedis).toEqual({ restUrl: 'https://eu1-redis.upstash.io', restToken: 'redis-token' });
        expect(environment.telegram).toEqual({ botToken: 'bot-token', chatId: '-100200300' });
        expect(environment.resendApiKey).toBe('re_key');
        expect(environment.notificationEmail).toBe('sales@swisscars.md');
    });

    it('keeps an integration disabled when only half of its credentials are set', () => {
        const environment = parseServerEnvironment({ TELEGRAM_BOT_TOKEN: 'bot-token', UPSTASH_REDIS_REST_TOKEN: 'token' });

        expect(environment.telegram).toBeNull();
        expect(environment.upstashRedis).toBeNull();
    });

    it('treats blank values as missing', () => {
        expect(parseServerEnvironment({ NOTIFICATION_EMAIL: '  ', RESEND_API_KEY: '' }).notificationEmail).toBeNull();
    });

    it('names malformed variables without echoing their values', () => {
        const parse = () => parseServerEnvironment({ NOTIFICATION_EMAIL: 'not-an-email', UPSTASH_REDIS_REST_URL: 'secret-host' });

        expect(parse).toThrow('Invalid server environment variables: UPSTASH_REDIS_REST_URL, NOTIFICATION_EMAIL');
        expect(parse).not.toThrow(/secret-host/);
    });

    it('returns a frozen object', () => {
        expect(Object.isFrozen(parseServerEnvironment({}))).toBe(true);
    });
});
