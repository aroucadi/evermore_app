import { GET } from '@/app/api/users/[id]/export/route';
import { NextRequest } from 'next/server';
import { expect, test, vi, describe, beforeEach } from 'vitest';

// Mock the dependencies
vi.mock('@/lib/infrastructure/di/container', () => ({
  exportBookUseCase: {
    execute: vi.fn().mockResolvedValue(Buffer.from('mock-pdf-content')),
  },
}));

describe('Export Endpoint Security', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test('should return 403 when x-user-id header does not match path id', async () => {
    const req = new NextRequest('http://localhost/api/users/user-B/export', {
      headers: {
        'x-user-id': 'user-A',
      },
    });

    const context = { params: Promise.resolve({ id: 'user-B' }) };
    const res = await GET(req, context);

    expect(res.status).toBe(403);
  });

  test('should return 200 when x-user-id matches path id', async () => {
    const req = new NextRequest('http://localhost/api/users/user-A/export', {
      headers: {
        'x-user-id': 'user-A',
      },
    });

    const context = { params: Promise.resolve({ id: 'user-A' }) };
    const res = await GET(req, context);

    expect(res.status).toBe(200);
  });
});
