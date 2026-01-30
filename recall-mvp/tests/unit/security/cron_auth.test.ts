import { describe, it, expect } from 'vitest';
import { validateCronAuth } from '../../../lib/auth/cron';

describe('validateCronAuth', () => {
    const VALID_SECRET = 'super-secret-cron-key-12345';

    it('should return true for valid authentication', () => {
        const result = validateCronAuth(`Bearer ${VALID_SECRET}`, VALID_SECRET);
        expect(result).toBe(true);
    });

    it('should return false if CRON_SECRET is undefined', () => {
        const result = validateCronAuth(`Bearer ${VALID_SECRET}`, undefined);
        expect(result).toBe(false);
    });

    it('should return false if auth header is null', () => {
        const result = validateCronAuth(null, VALID_SECRET);
        expect(result).toBe(false);
    });

    it('should return false if auth header is missing Bearer prefix', () => {
        const result = validateCronAuth(VALID_SECRET, VALID_SECRET);
        expect(result).toBe(false);
    });

    it('should return false if auth header has invalid format', () => {
        const result = validateCronAuth('Basic user:pass', VALID_SECRET);
        expect(result).toBe(false);
    });

    it('should return false if token is empty', () => {
        const result = validateCronAuth('Bearer ', VALID_SECRET);
        expect(result).toBe(false);
    });

    it('should return false if secret is incorrect (same length)', () => {
        const WRONG_SECRET = 'super-secret-cron-key-54321'; // Same length
        const result = validateCronAuth(`Bearer ${WRONG_SECRET}`, VALID_SECRET);
        expect(result).toBe(false);
    });

    it('should return false if secret is incorrect (different length)', () => {
        const SHORT_SECRET = 'short-secret';
        const result = validateCronAuth(`Bearer ${SHORT_SECRET}`, VALID_SECRET);
        expect(result).toBe(false);
    });
});
