import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/jwt';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/health',
  '/',
  '/favicon.ico',
];

// Routes that are public assets
const PUBLIC_ASSETS = [
  '/_next',
  '/images',
  '/public',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. STRIP SENSITIVE HEADERS (Security: Prevent spoofing)
  // We must delete these headers from the incoming request so that
  // downstream handlers can trust that if they exist, WE put them there.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-user-id');
  requestHeaders.delete('x-user-role');

  // 2. CHECK IF ROUTE IS PUBLIC
  let isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));

  // Special case: POST /api/users (Signup)
  if (pathname === '/api/users' && request.method === 'POST') {
    isPublicRoute = true;
  }

  const isPublicAsset = PUBLIC_ASSETS.some(route => pathname.startsWith(route));

  if (isPublicRoute || isPublicAsset) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 3. VALIDATE SESSION
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie?.value) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifySession(sessionCookie.value);

  if (!payload) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Session' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }

  // 4. INJECT TRUSTED HEADERS
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
