import { NextRequest, NextResponse } from 'next/server';
import { generateChapterUseCase, jobRepository } from '@/lib/infrastructure/di/container';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization') || '';

  // Security: Ensure CRON_SECRET is set
  if (!cronSecret) {
    console.error("CRON_SECRET is not set");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const expectedHeader = `Bearer ${cronSecret}`;

  // Security: Use constant-time comparison to prevent timing attacks
  let isAuthenticated = false;
  try {
    const inputBuffer = Buffer.from(authHeader);
    const expectedBuffer = Buffer.from(expectedHeader);

    // Check length match first to avoid exception in timingSafeEqual
    if (inputBuffer.length === expectedBuffer.length) {
      isAuthenticated = crypto.timingSafeEqual(inputBuffer, expectedBuffer);
    }
  } catch (error) {
    // Buffer creation failed or other error -> auth failed
    isAuthenticated = false;
  }

  if (!isAuthenticated) {
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
        await jobRepository.updateStatus(job.id, 'failed', undefined, error.message);
        results.push({ jobId: job.id, status: 'failed', error: error.message });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (error: any) {
    // Security: Log the full error but return a generic message to the client
    console.error('Cron job processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
