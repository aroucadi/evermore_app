
import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/cron/process-jobs/route';
import { NextRequest } from 'next/server';

// Mock the container dependencies
vi.mock('@/lib/infrastructure/di/container', () => ({
  jobRepository: {
    findPending: vi.fn().mockResolvedValue([]),
    updateStatus: vi.fn(),
  },
  generateChapterUseCase: {
    execute: vi.fn(),
  }
}));

describe('Cron Job Security', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV, CRON_SECRET: 'test-secret-123' };
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.clearAllMocks();
  });

  it('should reject requests without authorization header', async () => {
    const req = new NextRequest('http://localhost/api/cron/process-jobs');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should reject requests with incorrect authorization header', async () => {
    const req = new NextRequest('http://localhost/api/cron/process-jobs', {
      headers: { 'authorization': 'Bearer wrong-secret' }
    });
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('should accept requests with correct authorization header', async () => {
    const req = new NextRequest('http://localhost/api/cron/process-jobs', {
      headers: { 'authorization': 'Bearer test-secret-123' }
    });
    const res = await GET(req);

    // Should be 200 because jobs are empty
    expect(res.status).toBe(200);
  });

  it('should fail securely if CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;

    const req = new NextRequest('http://localhost/api/cron/process-jobs', {
        headers: { 'authorization': 'Bearer test-secret-123' }
    });
    const res = await GET(req);

    expect(res.status).toBe(500);
    // body variable was unused, so we just check status
  });
});
