
import { expect, test, vi, describe, beforeEach } from 'vitest';
import { PATCH, GET } from '@/app/api/users/[id]/preferences/route';
import { NextRequest } from 'next/server';
import { userProfileUpdater } from '@/lib/infrastructure/di/container';

// Mock DI container
vi.mock('@/lib/infrastructure/di/container', () => ({
  userProfileUpdater: {
    updateSeniorProfile: vi.fn(),
    getProfile: vi.fn(),
  },
}));

describe('PATCH /api/users/[id]/preferences - IDOR Protection', () => {
  const MOCK_SENIOR_ID = 'senior-123';
  const MOCK_OTHER_ID = 'senior-456';
  const MOCK_FAMILY_ID = 'family-789';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should allow update if x-user-id matches route param id', async () => {
    const req = new NextRequest(`http://localhost/api/users/${MOCK_SENIOR_ID}/preferences`, {
      method: 'PATCH',
      headers: {
        'x-user-id': MOCK_SENIOR_ID,
        'x-user-role': 'senior',
      },
      body: JSON.stringify({ updates: { voiceTone: 'Happy' } }),
    });

    // Mock update success
    (userProfileUpdater.updateSeniorProfile as any).mockResolvedValue({ id: MOCK_SENIOR_ID, preferences: {} });

    const params = Promise.resolve({ id: MOCK_SENIOR_ID });
    const res = await PATCH(req, { params });

    expect(res.status).toBe(200);
    expect(userProfileUpdater.updateSeniorProfile).toHaveBeenCalledWith(MOCK_SENIOR_ID, expect.anything());
  });

  test('should forbid update if x-user-id does not match route param id (Stranger)', async () => {
    const req = new NextRequest(`http://localhost/api/users/${MOCK_SENIOR_ID}/preferences`, {
      method: 'PATCH',
      headers: {
        'x-user-id': MOCK_OTHER_ID,
        'x-user-role': 'senior',
      },
      body: JSON.stringify({ updates: { voiceTone: 'Hacked' } }),
    });

    const params = Promise.resolve({ id: MOCK_SENIOR_ID });
    const res = await PATCH(req, { params });

    expect(res.status).toBe(403);
    expect(userProfileUpdater.updateSeniorProfile).not.toHaveBeenCalled();
  });

  test('should allow update if requester is family linked to senior', async () => {
    const req = new NextRequest(`http://localhost/api/users/${MOCK_SENIOR_ID}/preferences`, {
      method: 'PATCH',
      headers: {
        'x-user-id': MOCK_FAMILY_ID,
        'x-user-role': 'family',
      },
      body: JSON.stringify({ updates: { voiceTone: 'Helpful' } }),
    });

    // Mock family profile lookup finding the link
    (userProfileUpdater.getProfile as any).mockResolvedValue({
      id: MOCK_FAMILY_ID,
      role: 'family',
      seniorId: MOCK_SENIOR_ID
    });
     (userProfileUpdater.updateSeniorProfile as any).mockResolvedValue({ id: MOCK_SENIOR_ID });

    const params = Promise.resolve({ id: MOCK_SENIOR_ID });
    const res = await PATCH(req, { params });

    expect(res.status).toBe(200);
    expect(userProfileUpdater.updateSeniorProfile).toHaveBeenCalled();
  });

   test('should forbid update if requester is family BUT NOT linked to senior', async () => {
    const req = new NextRequest(`http://localhost/api/users/${MOCK_SENIOR_ID}/preferences`, {
      method: 'PATCH',
      headers: {
        'x-user-id': MOCK_FAMILY_ID,
        'x-user-role': 'family',
      },
      body: JSON.stringify({ updates: { voiceTone: 'Malicious' } }),
    });

    // Mock family profile lookup finding DIFFERENT senior
    (userProfileUpdater.getProfile as any).mockResolvedValue({
      id: MOCK_FAMILY_ID,
      role: 'family',
      seniorId: 'different-senior'
    });

    const params = Promise.resolve({ id: MOCK_SENIOR_ID });
    const res = await PATCH(req, { params });

    expect(res.status).toBe(403);
    expect(userProfileUpdater.updateSeniorProfile).not.toHaveBeenCalled();
  });

  test('should return 401 if x-user-id header is missing', async () => {
     const req = new NextRequest(`http://localhost/api/users/${MOCK_SENIOR_ID}/preferences`, {
      method: 'PATCH',
      headers: {
        // Missing x-user-id
      },
      body: JSON.stringify({ updates: {} }),
    });

    const params = Promise.resolve({ id: MOCK_SENIOR_ID });
    const res = await PATCH(req, { params });

    expect(res.status).toBe(401);
  });
});
