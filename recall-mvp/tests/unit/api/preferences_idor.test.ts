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

describe('Preferences API IDOR Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (method: string, url: string, body: any = null, headers: Record<string, string> = {}) => {
    return new NextRequest(url, {
      method,
      body: body ? JSON.stringify(body) : null,
      headers: new Headers(headers),
    });
  };

  describe('PATCH /api/users/[id]/preferences', () => {
    it('should allow updates when authenticated user matches route param', async () => {
      const userId = 'user-123';
      const updates = { topicsLove: ['Security'] };

      const req = createRequest(
        'PATCH',
        `http://localhost:3000/api/users/${userId}/preferences`,
        { updates },
        { 'x-user-id': userId }
      );

      (userProfileUpdater.updateSeniorProfile as any).mockResolvedValue({ id: userId, ...updates });

      const res = await PATCH(req, { params: Promise.resolve({ id: userId }) });

      expect(res.status).toBe(200);
      expect(userProfileUpdater.updateSeniorProfile).toHaveBeenCalledWith(userId, expect.anything());
    });

    it('should FORBID updates when authenticated user DOES NOT match route param (IDOR)', async () => {
      const victimId = 'user-victim';
      const attackerId = 'user-attacker';
      const updates = { topicsLove: ['Hacking'] };

      const req = createRequest(
        'PATCH',
        `http://localhost:3000/api/users/${victimId}/preferences`,
        { updates },
        { 'x-user-id': attackerId }
      );

      // Mock should NOT be called if we block it
      (userProfileUpdater.updateSeniorProfile as any).mockResolvedValue({ id: victimId, ...updates });

      const res = await PATCH(req, { params: Promise.resolve({ id: victimId }) });

      expect(res.status).toBe(403); // This will FAIL currently (returns 200)
      expect(userProfileUpdater.updateSeniorProfile).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/users/[id]/preferences', () => {
     it('should FORBID viewing preferences when authenticated user DOES NOT match route param (IDOR)', async () => {
      const victimId = 'user-victim';
      const attackerId = 'user-attacker';

      const req = createRequest(
        'GET',
        `http://localhost:3000/api/users/${victimId}/preferences`,
        null,
        { 'x-user-id': attackerId }
      );

      (userProfileUpdater.getProfile as any).mockResolvedValue({ id: victimId, preferences: {} });

      const res = await GET(req, { params: Promise.resolve({ id: victimId }) });

      expect(res.status).toBe(403); // This will FAIL currently (returns 200)
      expect(userProfileUpdater.getProfile).not.toHaveBeenCalled();
    });
  });
});
