import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../../lib/utils';

describe('utils', () => {
  describe('escapeHtml', () => {
    it('should escape special characters', () => {
      const input = '<script>alert("xss")</script>';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });

    it('should preserve safe characters', () => {
      const input = 'Hello World';
      expect(escapeHtml(input)).toBe(input);
    });

    it('should handle mixed content', () => {
      const input = 'Bold & Beautiful';
      const expected = 'Bold &amp; Beautiful';
      expect(escapeHtml(input)).toBe(expected);
    });

    it('should escape single quotes', () => {
      const input = "It's me";
      const expected = "It&#039;s me";
      expect(escapeHtml(input)).toBe(expected);
    });
  });
});
