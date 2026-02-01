import { PATCH } from '@/app/api/users/[id]/preferences/route';
import { NextRequest } from 'next/server';
import { expect, test, vi, describe } from 'vitest';

// Mock the dependencies
vi.mock('@/lib/infrastructure/di/container', () => ({
  userProfileUpdater: {
    updateSeniorProfile: vi.fn().mockResolvedValue({ id: 'target-user-id', preferences: {} }),
    getProfile: vi.fn(),
  },
}));

describe('Preferences IDOR Security', () => {
  test('should return 403 when x-user-id does not match route param id', async () => {
    const req = new NextRequest('http://localhost/api/users/target-user-id/preferences', {
      method: 'PATCH',
      headers: {
        'x-user-id': 'attacker-user-id', // Mismatch!
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates: { voiceTone: 'fast' } }),
    });

    // We pass the context with params as a Promise, matching Next.js 15/16 style
    const context = { params: Promise.resolve({ id: 'target-user-id' }) };

    const res = await PATCH(req, context);

    // This assertion fails if IDOR is present (it will return 200)
    expect(res.status).toBe(403);
  });

  test('should return 200 when x-user-id matches route param id', async () => {
    const req = new NextRequest('http://localhost/api/users/target-user-id/preferences', {
      method: 'PATCH',
      headers: {
        'x-user-id': 'target-user-id', // Match!
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates: { voiceTone: 'fast' } }),
    });

    const context = { params: Promise.resolve({ id: 'target-user-id' }) };

    const res = await PATCH(req, context);

    expect(res.status).toBe(200);
  });
});
