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

describe('User Preferences IDOR Vulnerability', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('PATCH should deny updating another user preferences (IDOR Check)', async () => {
    // Scenario: Attacker (ID: attacker-123) tries to update Victim (ID: victim-456)
    const victimId = 'victim-456';
    const attackerId = 'attacker-123';

    // Mock request with Attacker's session but Victim's URL ID
    const req = new NextRequest(`http://localhost/api/users/${victimId}/preferences`, {
      method: 'PATCH',
      headers: {
        'x-user-id': attackerId, // Injected by middleware
        'x-user-role': 'user',
      },
      body: JSON.stringify({ updates: { voiceTone: 'mocking' } }),
    });

    const params = Promise.resolve({ id: victimId });

    const res = await PATCH(req, { params });

    // Expect 403 Forbidden
    expect(res.status).toBe(403);
  });

  test('GET should deny viewing another user preferences (IDOR Check)', async () => {
      // Scenario: Attacker (ID: attacker-123) tries to view Victim (ID: victim-456)
      const victimId = 'victim-456';
      const attackerId = 'attacker-123';

      // Mock request with Attacker's session but Victim's URL ID
      const req = new NextRequest(`http://localhost/api/users/${victimId}/preferences`, {
        method: 'GET',
        headers: {
          'x-user-id': attackerId, // Injected by middleware
          'x-user-role': 'user',
        },
      });

      const params = Promise.resolve({ id: victimId });

      const res = await GET(req, { params });

      expect(res.status).toBe(403);
    });
});
