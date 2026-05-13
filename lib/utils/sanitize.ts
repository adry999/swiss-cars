const DANGEROUS_TAGS = /(<\s*(script|iframe|object|embed|applet|meta|link|style|base|form|input|button|textarea|select)\b[^>]*>[\s\S]*?<\/\s*\2\s*>|<\s*(script|iframe|object|embed|applet|meta|link|style|base|form|input|button|textarea|select)\b[^>]*\/?> ?)/gi;

const DANGEROUS_ATTRS = /\s+(on\w+|href\s*=\s*["']?\s*(javascript|data|vbscript)\s*:|src\s*=\s*["']?\s*(javascript|data|vbscript)\s*:)[^>]*/gi;

// Strips dangerous tags and event/javascript attributes from HTML.
export function sanitizeHtml(html: string): string {
    if (!html) return '';

    return html
        .replace(DANGEROUS_TAGS, '')
        .replace(DANGEROUS_ATTRS, '')
        .replace(/<!--[\s\S]*?-->/g, '');
}
