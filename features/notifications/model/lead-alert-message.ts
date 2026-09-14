import type { LeadInquirySubmitted } from '@shared/contracts/domain-events';

// Vercel functions run in UTC; the sales team reads alerts in Moldovan time.
const submittedAtFormat = new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Chisinau',
});

export interface EmailLeadAlert {
    subject: string;
    html: string;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeTelegramMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

// Inside the (...) target of a MarkdownV2 link only ')' and '\' are special.
function escapeTelegramLinkTarget(url: string): string {
    return url.replace(/[)\\]/g, '\\$&');
}

/** `sourceUrl` is sent by the browser, so only absolute http(s) links reach a template. */
export function toSafeHttpUrl(rawUrl: string | null): string | null {
    if (!rawUrl) return null;
    try {
        const url = new URL(rawUrl);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
    } catch {
        return null;
    }
}

function subjectLabel(inquiry: LeadInquirySubmitted): string {
    return inquiry.formType === 'inquiry' ? 'Mașină' : 'Solicitare';
}

function formatSubmittedAt(submittedAt: string): string {
    return submittedAtFormat.format(new Date(submittedAt));
}

export function formatTelegramLeadAlert(inquiry: LeadInquirySubmitted): string {
    const sourceUrl = toSafeHttpUrl(inquiry.sourceUrl);
    const heading = sourceUrl
        ? `[${escapeTelegramMarkdown(sourceUrl)}](${escapeTelegramLinkTarget(sourceUrl)})`
        : 'SwissCars\\.md';

    const lines = [
        `🔔 *Lead nou* \\- ${heading}`,
        '',
        `👤 *Nume:* ${escapeTelegramMarkdown(inquiry.customerName)}`,
        `📱 *Telefon:* \`${escapeTelegramMarkdown(inquiry.customerPhone)}\``,
        `📧 *Email:* ${escapeTelegramMarkdown(inquiry.customerEmail ?? 'N/A')}`,
        `🚗 *${subjectLabel(inquiry)}:* ${escapeTelegramMarkdown(inquiry.subject)}`,
    ];
    if (inquiry.preferredDate) {
        lines.push(`📅 *Data preferată:* ${escapeTelegramMarkdown(inquiry.preferredDate)}`);
    }
    lines.push(
        '',
        '💬 *Mesaj:*',
        inquiry.message ? escapeTelegramMarkdown(inquiry.message) : '_Fără mesaj_',
        '',
        `🕒 _${escapeTelegramMarkdown(formatSubmittedAt(inquiry.submittedAt))}_`,
    );

    return lines.join('\n');
}

export function formatEmailLeadAlert(inquiry: LeadInquirySubmitted): EmailLeadAlert {
    const sourceUrl = toSafeHttpUrl(inquiry.sourceUrl);
    const phone = escapeHtml(inquiry.customerPhone);

    const detailRows: Array<[label: string, valueHtml: string]> = [
        ['Nume', escapeHtml(inquiry.customerName)],
        ['Telefon', `<a href="tel:${phone}">${phone}</a>`],
        ['Email', escapeHtml(inquiry.customerEmail ?? 'N/A')],
        [subjectLabel(inquiry), escapeHtml(inquiry.subject)],
    ];
    if (inquiry.preferredDate) {
        detailRows.push(['Data preferată', escapeHtml(inquiry.preferredDate)]);
    }
    if (sourceUrl) {
        detailRows.push(['Sursă', `<a href="${escapeHtml(sourceUrl)}">${escapeHtml(sourceUrl)}</a>`]);
    }

    const html = [
        '<h2>Lead nou SwissCars.md</h2>',
        ...detailRows.map(([label, valueHtml]) => `<p><strong>${label}:</strong> ${valueHtml}</p>`),
        '<hr />',
        '<p><strong>Mesaj:</strong></p>',
        `<p>${escapeHtml(inquiry.message ?? 'N/A')}</p>`,
        '<hr />',
        `<p><small>Trimis la: ${escapeHtml(formatSubmittedAt(inquiry.submittedAt))}</small></p>`,
    ].join('\n');

    // The subject is a plain-text header: HTML entities would show literally, line breaks could split it.
    const subject = `Lead nou: ${inquiry.customerName} - ${inquiry.subject}`.replace(/\s*[\r\n]+\s*/g, ' ');

    return { subject, html };
}
