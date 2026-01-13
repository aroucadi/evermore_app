import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/cron/process-jobs/route';
import { NextRequest } from 'next/server';

// Mocks
vi.mock('@/lib/infrastructure/di/container', () => ({
  generateChapterUseCase: {
    execute: vi.fn(),
  },
  jobRepository: {
    findPending: vi.fn().mockResolvedValue([]),
    updateStatus: vi.fn(),
  },
}));

describe('Cron Job Authentication', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, CRON_SECRET: 'super-secret-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 401 if CRON_SECRET is not set in env', async () => {
    delete process.env.CRON_SECRET;
    const req = new NextRequest('http://localhost/api/cron/process-jobs', {
      headers: { authorization: 'Bearer super-secret-key' },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 if authorization header is missing', async () => {
    const req = new NextRequest('http://localhost/api/cron/process-jobs');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 if token is incorrect', async () => {
    const req = new NextRequest('http://localhost/api/cron/process-jobs', {
      headers: { authorization: 'Bearer wrong-key' },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 if token has different length', async () => {
      const req = new NextRequest('http://localhost/api/cron/process-jobs', {
        headers: { authorization: 'Bearer super-secret-key-long' },
      });
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

  it('should return 200 if token is correct', async () => {
    const req = new NextRequest('http://localhost/api/cron/process-jobs', {
      headers: { authorization: 'Bearer super-secret-key' },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
