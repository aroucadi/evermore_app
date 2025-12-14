import { NextRequest, NextResponse } from 'next/server';
import { generateChapterUseCase, jobRepository } from '@/lib/infrastructure/di/container';

export async function GET(request: NextRequest) {
  // Simple security check (in real app, use a secret key)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
