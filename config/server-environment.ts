import 'server-only';
import { z } from 'zod';

const blankAsMissing = (value: unknown) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value;

const optionalText = z.preprocess(blankAsMissing, z.string().trim().optional());
const optionalUrl = z.preprocess(blankAsMissing, z.url().optional());
const optionalEmail = z.preprocess(blankAsMissing, z.email().optional());

const ServerEnvironmentSchema = z.object({
    UPSTASH_REDIS_REST_URL: optionalUrl,
    UPSTASH_REDIS_REST_TOKEN: optionalText,
    TELEGRAM_BOT_TOKEN: optionalText,
    TELEGRAM_CHAT_ID: optionalText,
    NOTIFICATION_EMAIL: optionalEmail,
    RESEND_API_KEY: optionalText,
});

export interface ServerEnvironment {
    upstashRedis: { restUrl: string; restToken: string } | null;
    telegram: { botToken: string; chatId: string } | null;
    resendApiKey: string | null;
    notificationEmail: string | null;
}

/**
 * Integrations configured with only half of their credentials stay disabled, as they did before
 * this module existed; a malformed value is a deployment error and fails loudly.
 */
export function parseServerEnvironment(source: Record<string, string | undefined>): ServerEnvironment {
    const parsed = ServerEnvironmentSchema.safeParse(source);
    if (!parsed.success) {
        const invalidVariables = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))];
        throw new Error(`Invalid server environment variables: ${invalidVariables.join(', ')}`);
    }

    const variables = parsed.data;
    return Object.freeze({
        upstashRedis:
            variables.UPSTASH_REDIS_REST_URL && variables.UPSTASH_REDIS_REST_TOKEN
                ? { restUrl: variables.UPSTASH_REDIS_REST_URL, restToken: variables.UPSTASH_REDIS_REST_TOKEN }
                : null,
        telegram:
            variables.TELEGRAM_BOT_TOKEN && variables.TELEGRAM_CHAT_ID
                ? { botToken: variables.TELEGRAM_BOT_TOKEN, chatId: variables.TELEGRAM_CHAT_ID }
                : null,
        resendApiKey: variables.RESEND_API_KEY ?? null,
        notificationEmail: variables.NOTIFICATION_EMAIL ?? null,
    });
}

let cachedServerEnvironment: ServerEnvironment | undefined;

export function getServerEnvironment(): ServerEnvironment {
    cachedServerEnvironment ??= parseServerEnvironment(process.env);
    return cachedServerEnvironment;
}
