import { NextRequest, NextResponse } from 'next/server';
import { generateChapterUseCase, jobRepository } from '@/lib/infrastructure/di/container';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  // Security: Ensure CRON_SECRET is set to prevent default-value bypass
  if (!cronSecret) {
    console.error('CRON_SECRET is not set in environment variables');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  // Security: Use timingSafeEqual to prevent timing attacks
  const expectedAuth = `Bearer ${cronSecret}`;
  const providedAuth = authHeader || '';

  const expectedBuffer = Buffer.from(expectedAuth);
  const providedBuffer = Buffer.from(providedAuth);

  const isLengthMatch = expectedBuffer.length === providedBuffer.length;
  // We use a dummy buffer for comparison if lengths don't match to avoid leaking length info via timing,
  // though length leakage is often acceptable. Here we just fail if length mismatch.

  if (!isLengthMatch || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
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
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
