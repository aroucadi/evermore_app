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

describe('IDOR /api/users/[id]/preferences', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createRequest = (method: string, body: any = null, headers: Record<string, string> = {}) => {
        return new NextRequest(`http://localhost:3000/api/users/victim-id/preferences`, {
            method,
            body: body ? JSON.stringify(body) : null,
            headers: new Headers(headers),
        });
    };

    it('PATCH should reject when x-user-id does not match route param id', async () => {
        const attackerId = 'attacker-id';
        const victimId = 'victim-id';
        const updates = { topicsLove: ['Hacked'] };

        const req = createRequest('PATCH', { updates }, { 'x-user-id': attackerId });
        const params = Promise.resolve({ id: victimId });

        const res = await PATCH(req, { params });

        expect(res.status).toBe(403);
        expect(userProfileUpdater.updateSeniorProfile).not.toHaveBeenCalled();
    });

    it('GET should reject when x-user-id does not match route param id', async () => {
        const attackerId = 'attacker-id';
        const victimId = 'victim-id';

        const req = createRequest('GET', null, { 'x-user-id': attackerId });
        const params = Promise.resolve({ id: victimId });

        const res = await GET(req, { params });

        expect(res.status).toBe(403);
        expect(userProfileUpdater.getProfile).not.toHaveBeenCalled();
    });

    it('PATCH should allow when x-user-id matches route param id', async () => {
        const userId = 'user-1';
        const updates = { topicsLove: ['Safe'] };

        const req = new NextRequest(`http://localhost:3000/api/users/${userId}/preferences`, {
             method: 'PATCH',
             body: JSON.stringify({ updates }),
             headers: new Headers({ 'x-user-id': userId })
        });
        const params = Promise.resolve({ id: userId });

        (userProfileUpdater.updateSeniorProfile as any).mockResolvedValue({ id: userId, ...updates });

        const res = await PATCH(req, { params });

        expect(res.status).toBe(200);
        expect(userProfileUpdater.updateSeniorProfile).toHaveBeenCalled();
    });
});
