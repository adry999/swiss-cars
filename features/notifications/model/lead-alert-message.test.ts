// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildLeadInquirySubmitted } from '../test-support/lead-inquiry-submitted';
import { formatEmailLeadAlert, formatTelegramLeadAlert, toSafeHttpUrl } from './lead-alert-message';

describe('formatTelegramLeadAlert', () => {
    it('escapes customer text so it cannot inject MarkdownV2 formatting or links', () => {
        const message = formatTelegramLeadAlert(
            buildLeadInquirySubmitted({ customerName: '*Admin*_[x](http://evil.md) a\\b' }),
        );

        expect(message).toContain('👤 *Nume:* \\*Admin\\*\\_\\[x\\]\\(http://evil\\.md\\) a\\\\b');
    });

    it('links the page the lead came from, escaping the link target', () => {
        const message = formatTelegramLeadAlert(
            buildLeadInquirySubmitted({ sourceUrl: 'https://swisscars.md/inventory/bmw-(x5)' }),
        );

        expect(message).toContain('(https://swisscars.md/inventory/bmw-(x5\\))');
    });

    it('falls back to the site name when the source URL is not http(s)', () => {
        const message = formatTelegramLeadAlert(buildLeadInquirySubmitted({ sourceUrl: 'javascript:alert(1)' }));

        expect(message).toContain('🔔 *Lead nou* \\- SwissCars\\.md');
        expect(message).not.toContain('javascript');
    });

    it('labels a general request and shows its preferred date', () => {
        const message = formatTelegramLeadAlert(
            buildLeadInquirySubmitted({ formType: 'testdrive', subject: 'Programare Vizionare', preferredDate: '2026-09-20' }),
        );

        expect(message).toContain('🚗 *Solicitare:* Programare Vizionare');
        expect(message).toContain('📅 *Data preferată:* 2026\\-09\\-20');
    });

    it('shows the submission time in Moldovan time', () => {
        const message = formatTelegramLeadAlert(buildLeadInquirySubmitted({ submittedAt: '2026-09-13T09:30:00.000Z' }));

        expect(message).toContain('12:30');
    });
});

describe('formatEmailLeadAlert', () => {
    it('escapes customer text in the HTML body', () => {
        const { html } = formatEmailLeadAlert(
            buildLeadInquirySubmitted({ customerName: '<img src=x onerror=alert(1)>' }),
        );

        expect(html).not.toContain('<img');
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('keeps the subject on a single plain-text line', () => {
        const { subject } = formatEmailLeadAlert(
            buildLeadInquirySubmitted({ customerName: 'Ion & Co\r\nBcc: spam@example.md' }),
        );

        expect(subject).toBe('Lead nou: Ion & Co Bcc: spam@example.md - BMW X5 2020');
    });

    it('omits the source link when the URL is unsafe', () => {
        const { html } = formatEmailLeadAlert(buildLeadInquirySubmitted({ sourceUrl: 'data:text/html,hi' }));

        expect(html).not.toContain('Sursă');
    });
});

describe('toSafeHttpUrl', () => {
    it.each([
        ['https://swisscars.md/contact', 'https://swisscars.md/contact'],
        ['javascript:alert(1)', null],
        ['not a url', null],
        [null, null],
    ])('turns %s into %s', (rawUrl, expected) => {
        expect(toSafeHttpUrl(rawUrl)).toBe(expected);
    });
});
