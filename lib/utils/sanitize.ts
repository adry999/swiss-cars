import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
    return html ? DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
        FORBID_ATTR: ['style'],
    }) : '';
}
