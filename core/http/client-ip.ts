export const UNKNOWN_CLIENT_IP = 'unknown';

/** On Vercel `x-forwarded-for` is overwritten by the edge, so its first entry is the real client. */
export function readClientIp(headers: Headers): string {
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    return headers.get('x-real-ip') ?? UNKNOWN_CLIENT_IP;
}
