import { timingSafeEqual } from 'crypto';

/**
 * Validates the Cron Job authentication header using constant-time comparison.
 * Prevents timing attacks and handles missing configuration securely.
 *
 * @param authHeader The raw Authorization header (e.g., "Bearer <secret>")
 * @param cronSecret The server-side CRON_SECRET environment variable
 * @returns true if authenticated, false otherwise
 */
export function validateCronAuth(authHeader: string | null, cronSecret: string | undefined): boolean {
    // Fail closed if secret is not configured
    if (!cronSecret) {
        return false;
    }

    // Fail closed if header is missing
    if (!authHeader) {
        return false;
    }

    // Validate format
    if (!authHeader.startsWith('Bearer ')) {
        return false;
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
        return false;
    }

    // Convert to buffers for safe comparison
    const tokenBuffer = Buffer.from(token);
    const secretBuffer = Buffer.from(cronSecret);

    // Check length first to prevent error in timingSafeEqual
    if (tokenBuffer.length !== secretBuffer.length) {
        return false;
    }

    // Perform constant-time comparison
    return timingSafeEqual(tokenBuffer, secretBuffer);
}
