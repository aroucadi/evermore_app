import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH, GET } from '@/app/api/users/[id]/preferences/route';
import { NextRequest, NextResponse } from 'next/server';

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

  const createRequest = (method: string, body: any = null, headers: Record<string, string> = {}) => {
    return new NextRequest('http://localhost:3000/api/users/victim-id/preferences', {
      method,
      body: body ? JSON.stringify(body) : null,
      headers: new Headers(headers),
    });
  };

  const params = Promise.resolve({ id: 'victim-id' });

  it('PATCH should reject request if x-user-id does not match route param', async () => {
    const req = createRequest(
      'PATCH',
      { voiceTone: 'formal' },
      { 'x-user-id': 'attacker-id' } // Mismatch
    );

    // Mock successful update if called (simulating vulnerability)
    (userProfileUpdater.updateSeniorProfile as any).mockResolvedValue({ id: 'victim-id' });

    const res = await PATCH(req, { params });

    // Check for IDOR protection (401/403)
    expect(res.status).toBe(401);

    // Ensure we didn't call the updater
    expect(userProfileUpdater.updateSeniorProfile).not.toHaveBeenCalled();
  });

  it('GET should reject request if x-user-id does not match route param', async () => {
    const req = createRequest(
      'GET',
      null,
      { 'x-user-id': 'attacker-id' } // Mismatch
    );

    (userProfileUpdater.getProfile as any).mockResolvedValue({ id: 'victim-id', preferences: {} });

    const res = await GET(req, { params });

    expect(res.status).toBe(401);
    expect(userProfileUpdater.getProfile).not.toHaveBeenCalled();
  });

  it('PATCH should allow request if x-user-id matches route param', async () => {
    const req = createRequest(
      'PATCH',
      { voiceTone: 'formal' },
      { 'x-user-id': 'victim-id' } // Match
    );

    (userProfileUpdater.updateSeniorProfile as any).mockResolvedValue({ id: 'victim-id' });

    const res = await PATCH(req, { params });

    expect(res.status).toBe(200);
    expect(userProfileUpdater.updateSeniorProfile).toHaveBeenCalledWith('victim-id', expect.objectContaining({ voiceTone: 'formal' }));
  });

  it('GET should allow request if x-user-id matches route param', async () => {
    const req = createRequest(
      'GET',
      null,
      { 'x-user-id': 'victim-id' } // Match
    );

    (userProfileUpdater.getProfile as any).mockResolvedValue({ id: 'victim-id', preferences: {} });

    const res = await GET(req, { params });

    expect(res.status).toBe(200);
    expect(userProfileUpdater.getProfile).toHaveBeenCalledWith('victim-id');
  });
});
