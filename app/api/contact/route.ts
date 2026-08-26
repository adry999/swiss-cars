import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp, LEAD_RATE_LIMIT } from '@/lib/utils/rateLimit';

const ContactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').trim(),
    phone: z.string().min(7, 'Numărul de telefon trebuie să aibă minim 7 caractere').max(35, 'Numărul de telefon este prea lung'),
    email: z.string().email('Invalid email format').max(255).optional().or(z.literal('')),
    message: z.string().max(5000, 'Message too long').optional(),
    preferredDate: z.string().max(50).optional(),
    formType: z.enum(['contact', 'inquiry', 'callback', 'testdrive']).optional().default('contact'),
    sourceUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const clientIp = getClientIp(req);
        const rateLimit = checkRateLimit(`contact:${clientIp}`, LEAD_RATE_LIMIT);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await req.json();

        // Validate input with Zod. Never log the body — it carries names,
        // phone numbers, emails and free-text messages.
        const validation = ContactSchema.safeParse(body);
        if (!validation.success) {
            const errors = validation.error.issues.map(e => e.message).join(', ');
            console.error('Contact validation error:', errors);
            return NextResponse.json({ error: `Validation: ${errors}` }, { status: 400 });
        }

        const { name, phone, email, message, preferredDate, formType, sourceUrl } = validation.data;

        const supabase = await createClient();

        // Routed through the submit_lead() RPC — see
        // database/2026-08-26_lead_subscriber_rpc.sql — rather than a direct
        // .insert(), which anon could otherwise call directly with no
        // validation via the Supabase REST API.
        const { error } = await supabase.rpc('submit_lead', {
            p_car_id: null,
            p_car_name: formType === 'testdrive' ? 'Programare Vizionare' : 'Contact General',
            p_name: name,
            p_phone: phone,
            p_email: email || null,
            p_message: message || null,
            p_preferred_date: preferredDate || null,
            p_form_type: formType || 'contact',
            p_source_url: sourceUrl || null,
        });

        if (error) {
            console.error('Contact form DB error details:', error);
            return NextResponse.json({ error: 'Could not save your request. Please try again.' }, { status: 500 });
        }

        // Awaited, not fire-and-forget: the function may terminate before a
        // floating promise resolves, dropping the alert.
        try {
            const { getNotificationConfig } = await import('@/lib/settings');
            const { sendTelegramNotification, sendEmailNotification } = await import('@/lib/utils/notifications');

            const notify = await getNotificationConfig();
            const leadData = {
                name,
                phone,
                email,
                car_name: formType === 'testdrive' ? '📅 Programare Vizionare' : '📩 Contact General',
                message: `${message ? `"${message}"` : ''}${preferredDate ? `\n📅 Data preferată: ${preferredDate}` : ''}${formType ? `\n(Tip: ${formType})` : ''}`,
                source_url: sourceUrl,
            };

            await Promise.allSettled([
                notify.telegramBotToken && notify.telegramChatId
                    ? sendTelegramNotification(notify.telegramBotToken, notify.telegramChatId, leadData)
                    : Promise.resolve(),
                notify.notificationEmail
                    ? sendEmailNotification(notify.notificationEmail, leadData)
                    : Promise.resolve(),
            ]);
        } catch (notifyError) {
            console.error('Contact notification trigger error:', notifyError);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Contact API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
