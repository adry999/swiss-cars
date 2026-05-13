import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
    it('should return empty string for null/undefined input', () => {
        expect(sanitizeHtml('')).toBe('');
        expect(sanitizeHtml(null as any)).toBe('');
        expect(sanitizeHtml(undefined as any)).toBe('');
    });

    it('should allow basic formatting tags', () => {
        const input = '<p>Hello <strong>World</strong> and <em>italic</em></p>';
        const result = sanitizeHtml(input);
        expect(result).toContain('<p>');
        expect(result).toContain('<strong>');
        expect(result).toContain('<em>');
    });

    it('should strip script tags', () => {
        const input = '<p>Safe</p><script>alert("xss")</script>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('alert');
        expect(result).toContain('<p>Safe</p>');
    });

    it('should strip onclick and other event handlers', () => {
        const input = '<button onclick="alert(1)">Click</button>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('onclick');
    });

    it('should strip onerror attribute', () => {
        const input = '<img onerror="alert(1)" src="x">';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('onerror');
    });

    it('should allow anchor tags with href', () => {
        const input = '<a href="https://example.com">Link</a>';
        const result = sanitizeHtml(input);
        expect(result).toContain('href="https://example.com"');
    });

    it('should strip iframe tags', () => {
        const input = '<iframe src="https://evil.com"></iframe>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('<iframe');
    });

    it('should strip form tags', () => {
        const input = '<form action="/steal"><input type="text"></form>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('<form');
        expect(result).not.toContain('<input');
    });

    it('should allow list elements', () => {
        const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
        const result = sanitizeHtml(input);
        expect(result).toContain('<ul>');
        expect(result).toContain('<li>');
    });

    it('should allow heading tags', () => {
        const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        headings.forEach((tag) => {
            const input = `<${tag}>Heading</${tag}>`;
            const result = sanitizeHtml(input);
            expect(result).toContain(`<${tag}>`);
        });
    });

    it('should allow table elements', () => {
        const input = '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
        const result = sanitizeHtml(input);
        expect(result).toContain('<table>');
        expect(result).toContain('<th>');
        expect(result).toContain('<td>');
    });
});
