export interface LeadNotification {
    name?: string;
    phone?: string;
    email?: string;
    car_name?: string;
    message?: string;
    source_url?: string;
}

// Escape HTML special characters to prevent XSS
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Escape Telegram MarkdownV2 special characters
function escapeMarkdown(str: string): string {
    return str.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

/**
 * Only allow absolute http(s) URLs through to notification templates.
 * `source_url` arrives from the browser, so it is attacker-controlled.
 */
function safeUrl(raw?: string): string | null {
    if (!raw) return null;
    try {
        const url = new URL(raw);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
        return url.toString();
    } catch {
        return null;
    }
}

export async function sendTelegramNotification(
    token: string,
    chatId: string,
    lead: LeadNotification
) {
    if (!token || !chatId) return;

    // Escape user-provided content to prevent injection
    const safeName = escapeMarkdown(lead.name || '');
    const safePhone = escapeMarkdown(lead.phone || '');
    const safeEmail = escapeMarkdown(lead.email || 'N/A');
    const safeCarName = escapeMarkdown(lead.car_name || 'Inquiry General');
    const safeMessage = lead.message ? escapeMarkdown(lead.message) : '_Fără mesaj_';

    // Link label must be escaped; the URL inside (…) must not be.
    const url = safeUrl(lead.source_url);
    const header = url ? `[${escapeMarkdown(url)}](${url})` : 'SwissCars\\.md';

    const message = `
🔔 *Lead Nou* \\- ${header}

👤 *Nume:* ${safeName}
📱 *Telefon:* \`${safePhone}\`
📧 *Email:* ${safeEmail}
🚗 *Mașină:* ${safeCarName}

💬 *Mesaj:*
${safeMessage}

📅 _Data: ${escapeMarkdown(new Date().toLocaleString('ro-RO'))}_
  `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                // escapeMarkdown() escapes the MarkdownV2 character set; the
                // legacy 'Markdown' parser leaves those backslashes visible.
                parse_mode: 'MarkdownV2',
            }),
        });

        if (!response.ok) {
            console.error('Telegram notification error:', await response.text());
        }
    } catch (error) {
        console.error('Telegram fetch error:', error);
    }
}

export async function sendEmailNotification(to: string, lead: LeadNotification) {
    // This requires the RESEND_API_KEY to be set in environment variables
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !to) return;

    const url = safeUrl(lead.source_url);

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'SwissCars Notifications <notifications@swisscars.md>',
                to: [to],
                subject: `Lead Nou: ${escapeHtml(lead.name || '')} - ${escapeHtml(lead.car_name || 'Contact')}`,
                html: `
                    <h2>Lead Nou SwissCars.md</h2>
                    <p><strong>Nume:</strong> ${escapeHtml(lead.name || '')}</p>
                    <p><strong>Telefon:</strong> <a href="tel:${escapeHtml(lead.phone || '')}">${escapeHtml(lead.phone || '')}</a></p>
                    <p><strong>Email:</strong> ${escapeHtml(lead.email || 'N/A')}</p>
                    <p><strong>Mașină:</strong> ${escapeHtml(lead.car_name || 'N/A')}</p>
                    ${url ? `<p><strong>Sursă:</strong> <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>` : ''}
                    <hr />
                    <p><strong>Mesaj:</strong></p>
                    <p>${escapeHtml(lead.message || 'N/A')}</p>
                    <hr />
                    <p><small>Trimis la: ${escapeHtml(new Date().toLocaleString('ro-RO'))}</small></p>
                `,
            }),
        });

        if (!response.ok) {
            console.error('Resend email error:', await response.text());
        }
    } catch (error) {
        console.error('Resend fetch error:', error);
    }
}
