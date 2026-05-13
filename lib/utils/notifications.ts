// Escape HTML special characters to prevent XSS
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Escape Markdown special characters for Telegram
function escapeMarkdown(str: string): string {
    return str.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

export async function sendTelegramNotification(token: string, chatId: string, lead: any) {
    if (!token || !chatId) return;

    // Escape user-provided content to prevent injection
    const safeName = escapeMarkdown(lead.name || '');
    const safePhone = escapeMarkdown(lead.phone || '');
    const safeEmail = escapeMarkdown(lead.email || 'N/A');
    const safeCarName = escapeMarkdown(lead.car_name || 'Inquiry General');
    // DO NOT escape the URL, otherwise the Telegram Markdown link [text](${url}) breaks
    const rawUrl = lead.source_url || '';
    const safeMessage = lead.message ? escapeMarkdown(lead.message) : '_Fără mesaj_';

    const message = `
🔔 *Lead Nou* ${rawUrl ? `- [${rawUrl}](${rawUrl})` : '- SwissCars.md'}

👤 *Nume:* ${safeName}
📱 *Telefon:* \`${safePhone}\`
📧 *Email:* ${safeEmail}
🚗 *Mașină:* ${safeCarName}

💬 *Mesaj:*
${safeMessage}

---
📅 _Data: ${new Date().toLocaleString('ro-RO')}_
  `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        if (!response.ok) {
            console.error('Telegram notification error:', await response.text());
        }
    } catch (error) {
        console.error('Telegram fetch error:', error);
    }
}

export async function sendEmailNotification(to: string, lead: any) {
    // This requires the RESEND_API_KEY to be set in environment variables
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !to) return;

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
                    ${lead.source_url ? `<p><strong>Sursă:</strong> <a href="${lead.source_url}">${lead.source_url}</a></p>` : ''}
                    <hr />
                    <p><strong>Mesaj:</strong></p>
                    <p>${escapeHtml(lead.message || 'N/A')}</p>
                    <hr />
                    <p><small>Trimis la: ${new Date().toLocaleString('ro-RO')}</small></p>
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
