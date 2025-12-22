import { NextRequest, NextResponse } from 'next/server';
import { generateChapterUseCase, jobRepository } from '@/lib/infrastructure/di/container';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  // Security: Ensure CRON_SECRET is set
  if (!cronSecret) {
    console.error('CRON_SECRET is not configured');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  // Security: Use timingSafeEqual to prevent timing attacks
  const expectedHeader = `Bearer ${cronSecret}`;
  const authorized = isAuthorized(authHeader, expectedHeader);

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch pending jobs
    const jobs = await jobRepository.findPending('generate_chapter', 5); // Process batch of 5

    const results = [];

    for (const job of jobs) {
      try {
        // Mark as processing
        await jobRepository.updateStatus(job.id, 'processing');

        const { sessionId } = job.payload;
        if (!sessionId) throw new Error("Missing sessionId in payload");

        // Execute core logic
        const chapterId = await generateChapterUseCase.execute(sessionId);

        // Mark as completed
        await jobRepository.updateStatus(job.id, 'completed', { chapterId });
        results.push({ jobId: job.id, status: 'completed', chapterId });

      } catch (error: any) {
        console.error(`Job ${job.id} failed:`, error);
        // Security: Do not expose error details
        await jobRepository.updateStatus(job.id, 'failed', undefined, 'Job execution failed');
        results.push({ jobId: job.id, status: 'failed', error: 'Job execution failed' });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (error: any) {
    console.error('Cron job process failed:', error);
    // Security: Do not expose error details
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function isAuthorized(authHeader: string | null, expectedHeader: string): boolean {
    if (!authHeader) return false;

    // Convert to buffers for timingSafeEqual
    const authBuffer = Buffer.from(authHeader);
    const expectedBuffer = Buffer.from(expectedHeader);

    // Timing attack prevention: Check length first, but continue execution or use constant time compare
    // However, timingSafeEqual REQUIRES equal length.
    // If lengths differ, it's definitely invalid.
    // To be strictly timing safe regarding length, one would hash both inputs.
    // But for this use case, checking length first is acceptable standard practice as long as we use timingSafeEqual for the content.

    if (authBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(authBuffer, expectedBuffer);
}
