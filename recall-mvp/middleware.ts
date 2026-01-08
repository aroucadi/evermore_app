import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/jwt';
import { logger } from '@/lib/core/application/Logger';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/reset-password',
  '/api/health',
  '/login',
  '/signup',
  '/onboarding',
  '/', // Landing page
];

// Helper to check if a route is public
function isPublicRoute(pathname: string, method: string) {
  // Special case: Signup endpoint is POST /api/users
  if (pathname === '/api/users' && method === 'POST') return true;

  // Exact match
  if (PUBLIC_ROUTES.includes(pathname)) return true;

  // Public static assets
  if (pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/images') ||
      pathname.startsWith('/icons')) {
    return true;
  }

  return false;
}

export async function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  const { pathname } = req.nextUrl;

  // SECURITY: Always strip client-provided user context headers to prevent spoofing
  requestHeaders.delete('x-user-id');
  requestHeaders.delete('x-user-role');

  // Skip Public Routes
  if (isPublicRoute(pathname, req.method)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Verify Authentication
  let token = req.cookies.get('session')?.value;
  const authHeader = req.headers.get('Authorization');
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) return handleUnauth(req, 'Missing Authentication');

  try {
    const payload = await verifySession(token);
    if (!payload) return handleUnauth(req, 'Invalid Token');

    // Inject Verified Context
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({ request: { headers: requestHeaders } });

  } catch (error) {
    logger.error('Middleware Auth Error', { error: String(error) });
    return handleUnauth(req, 'Internal Server Error', 500);
  }
}

function handleUnauth(req: NextRequest, error: string, status = 401) {
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json({ error: `Unauthorized: ${error}` }, { status });
  }
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
