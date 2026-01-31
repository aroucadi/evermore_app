import { PATCH, GET } from '@/app/api/users/[id]/preferences/route';
import { NextRequest } from 'next/server';
import { expect, test, vi, describe, beforeEach } from 'vitest';

// Mock the dependencies
vi.mock('@/lib/infrastructure/di/container', () => ({
  userProfileUpdater: {
    updateSeniorProfile: vi.fn(),
    getProfile: vi.fn(),
  },
}));

describe('User Preferences IDOR Security', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('PATCH should return 403 when x-user-id does not match route param', async () => {
    const params = Promise.resolve({ id: 'target-user-id' });
    const req = new NextRequest('http://localhost/api/users/target-user-id/preferences', {
      method: 'PATCH',
      headers: {
        'x-user-id': 'attacker-id',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ voiceTone: 'fast' })
    });

    const res = await PATCH(req, { params });
    expect(res.status).toBe(403);
  });

  test('GET should return 403 when x-user-id does not match route param', async () => {
    const params = Promise.resolve({ id: 'target-user-id' });
    const req = new NextRequest('http://localhost/api/users/target-user-id/preferences', {
      method: 'GET',
      headers: {
        'x-user-id': 'attacker-id',
      }
    });

    const res = await GET(req, { params });
    expect(res.status).toBe(403);
  });

  test('PATCH should allow request when x-user-id matches route param', async () => {
    const params = Promise.resolve({ id: 'valid-user-id' });
    const req = new NextRequest('http://localhost/api/users/valid-user-id/preferences', {
      method: 'PATCH',
      headers: {
        'x-user-id': 'valid-user-id',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ voiceTone: 'fast' })
    });

    // Mock success
    const { userProfileUpdater } = await import('@/lib/infrastructure/di/container');
    vi.mocked(userProfileUpdater.updateSeniorProfile).mockResolvedValue({ id: 'valid-user-id', preferences: {} } as any);

    const res = await PATCH(req, { params });
    expect(res.status).toBe(200);
  });

  test('GET should allow request when x-user-id matches route param', async () => {
    const params = Promise.resolve({ id: 'valid-user-id' });
    const req = new NextRequest('http://localhost/api/users/valid-user-id/preferences', {
      method: 'GET',
      headers: {
        'x-user-id': 'valid-user-id',
      }
    });

    // Mock success
    const { userProfileUpdater } = await import('@/lib/infrastructure/di/container');
    vi.mocked(userProfileUpdater.getProfile).mockResolvedValue({ id: 'valid-user-id', preferences: {} } as any);

    const res = await GET(req, { params });
    expect(res.status).toBe(200);
  });
});
