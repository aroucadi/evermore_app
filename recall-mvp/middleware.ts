import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/jwt';

// SECURITY: Allowlist of public routes. All other /api routes are blocked by default.
// This implements a "Fail Closed" security model.
const PUBLIC_ROUTES = [
    '/api/auth/login',
    '/api/health',
    '/api/users', // POST only (handled in logic below)
];

/**
 * Middleware function for API route protection.
 * Implements a "Fail Closed" security model where all /api routes
 * are protected by default, except those explicitly in PUBLIC_ROUTES.
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only apply to API routes (via matcher)
    if (pathname.startsWith('/api')) {
        // 1. Check if the route is explicitly public
        const isPublicRoute = PUBLIC_ROUTES.some(route => {
            // Special case for User Signup: Allow ONLY POST to /api/users, keep /api/users/* protected
            if (route === '/api/users') {
                return pathname === '/api/users' && request.method === 'POST';
            }
            return pathname.startsWith(route);
        });

        // Create a new response headers object to securely inject/strip headers
        const requestHeaders = new Headers(request.headers);

        // SECURITY: Always strip client-provided auth headers to prevent spoofing
        requestHeaders.delete('x-user-id');
        requestHeaders.delete('x-user-role');

        // 2. If not public, enforce authentication
        if (!isPublicRoute) {
            const sessionCookie = request.cookies.get('session');

            if (!sessionCookie?.value) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const payload = await verifySession(sessionCookie.value);

            if (!payload) {
                return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });
            }

            // 3. Inject user info into headers for downstream handlers
            requestHeaders.set('x-user-id', payload.userId);
            requestHeaders.set('x-user-role', payload.role);

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        }

        // If it IS a public route, we still return next() with stripped headers
        // This ensures even public routes don't get spoofed headers if they decided to check them
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'],
};
