import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH, GET } from '@/app/api/users/[id]/preferences/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/infrastructure/di/container', () => ({
  userProfileUpdater: {
    updateSeniorProfile: vi.fn(),
    getProfile: vi.fn(),
  },
}));

import { userProfileUpdater } from '@/lib/infrastructure/di/container';

describe('IDOR Vulnerability Check: /api/users/[id]/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (method: string, body: any = null, headers: Record<string, string> = {}) => {
    return new NextRequest('http://localhost:3000/api/users/target-id/preferences', {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: new Headers(headers),
    });
  };

  it('should REJECT updating another users preferences (IDOR protection)', async () => {
    // Authenticated as 'attacker-id', but trying to update 'target-id'
    const attackerId = 'attacker-id';
    const targetId = 'target-id';
    const updates = { topicsLove: ['Hacked'] };

    const req = createRequest('PATCH', { updates }, {
      'x-user-id': attackerId,
      'x-user-role': 'senior'
    });

    // params is a Promise
    const params = Promise.resolve({ id: targetId });

    const res = await PATCH(req, { params });

    // EXPECTED STATE: Should return 403 Forbidden
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toMatch(/Forbidden/);

    // Verify it did NOT call update
    expect(userProfileUpdater.updateSeniorProfile).not.toHaveBeenCalled();
  });

  it('should REJECT reading another users preferences (IDOR protection)', async () => {
    const attackerId = 'attacker-id';
    const targetId = 'target-id';

    const req = createRequest('GET', null, {
      'x-user-id': attackerId,
      'x-user-role': 'senior'
    });

    const params = Promise.resolve({ id: targetId });

    const res = await GET(req, { params });

    // EXPECTED STATE: Should return 403 Forbidden
    expect(res.status).toBe(403);

    // Verify it did NOT call getProfile
    expect(userProfileUpdater.getProfile).not.toHaveBeenCalled();
  });

  it('should ALLOW updating own preferences', async () => {
    const userId = 'my-id';
    const updates = { topicsLove: ['Safe'] };

    const req = createRequest('PATCH', { updates }, {
      'x-user-id': userId,
      'x-user-role': 'senior'
    });

    const params = Promise.resolve({ id: userId });

    (userProfileUpdater.updateSeniorProfile as any).mockResolvedValue({ id: userId, ...updates });

    const res = await PATCH(req, { params });

    expect(res.status).toBe(200);
    expect(userProfileUpdater.updateSeniorProfile).toHaveBeenCalledWith(userId, expect.objectContaining(updates));
  });
});
