import DOMPurify from 'isomorphic-dompurify';

/**
 * Strips dangerous markup from stored HTML before it reaches
 * `dangerouslySetInnerHTML`.
 *
 * This previously used hand-written regexes, which let several standard
 * payloads through — `<svg/onload=…>` and `<img/onerror=…>` both survived,
 * because the attribute pattern required whitespace before the handler and
 * `svg` was not in the tag list. See sanitize.test.ts.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';

    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
        FORBID_ATTR: ['style'],
    });
}
