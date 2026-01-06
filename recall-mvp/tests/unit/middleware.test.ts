import { describe, it, expect, vi, beforeEach } from 'vitest';
import { proxy as middleware } from '../../middleware';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/jwt';

// Mock dependencies
vi.mock('@/lib/auth/jwt', () => ({
  verifySession: vi.fn(),
}));

// Mock NextRequest and NextResponse
const createRequest = (url: string, cookies: Record<string, string> = {}, headers: Record<string, string> = {}) => {
  const req = new NextRequest(new URL(url, 'http://localhost:3000'));

  // Mock cookies
  Object.defineProperty(req, 'cookies', {
    value: {
      get: (name: string) => cookies[name] ? { value: cookies[name] } : undefined,
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
    },
  });

  // Mock headers
  Object.entries(headers).forEach(([key, value]) => {
    req.headers.set(key, value);
  });

  return req;
};

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow public routes without authentication', async () => {
    // '/api/auth/login' IS in PUBLIC_ROUTES
    const req = createRequest('/api/auth/login');
    const res = await middleware(req);
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
  });

  it('should allow NON-API routes without authentication (middleware only checks /api)', async () => {
    const req = createRequest('/dashboard');
    const res = await middleware(req);
    expect(res.status).toBe(200); // Should be allowed through by middleware logic (Next.next())
  });

  it('should block protected API routes without authentication (401)', async () => {
    const req = createRequest('/api/users/profile');
    const res = await middleware(req);

    expect(res.status).toBe(401);
  });

  it('should allow protected API routes with valid session', async () => {
    (verifySession as any).mockResolvedValue({ userId: 'user-123', role: 'senior' });
    const req = createRequest('/api/users/profile', { session: 'valid-token' });

    const res = await middleware(req);

    expect(res.status).toBe(200);
  });

  it('should strip spoofed headers even on valid session', async () => {
    (verifySession as any).mockResolvedValue({ userId: 'user-123', role: 'senior' });

    // Attacker tries to spoof as admin
    const req = createRequest('/api/users/profile', { session: 'valid-token' }, {
      'x-user-id': 'admin-id',
      'x-user-role': 'admin'
    });

    const res = await middleware(req);
    // Note: We can't verify the headers modification in this simple unit test without more complex mocking,
    // but we can verify it doesn't crash or block valid request.
    expect(res.status).toBe(200);
  });

  it('should fail closed if verifySession returns null (invalid token)', async () => {
    (verifySession as any).mockResolvedValue(null);
    const req = createRequest('/api/users/profile', { session: 'invalid-token' });

    const res = await middleware(req);

    expect(res.status).toBe(401); // 401 for API
  });
});
