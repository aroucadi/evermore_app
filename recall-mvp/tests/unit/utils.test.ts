import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../../lib/utils';

describe('escapeHtml', () => {
    it('should escape special characters', () => {
        const input = '<script>alert("xss")</script>';
        const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

    it('should handle strings with mixed characters', () => {
        const input = 'Hello & "World"';
        const expected = 'Hello &amp; &quot;World&quot;';
        expect(escapeHtml(input)).toBe(expected);
    });

    it('should not change safe strings', () => {
        const input = 'Hello World';
        expect(escapeHtml(input)).toBe(input);
    });
});
