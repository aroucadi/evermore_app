import { startSessionUseCase } from '@/lib/infrastructure/di/container';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/core/application/Logger';
import {
  checkRateLimit,
  RATE_LIMIT_PRESETS,
  createRateLimitHeaders
} from '@/lib/core/application/security/RateLimiter';
import {
  withIdempotency,
  extractIdempotencyKey,
  createRequestFingerprint
} from '@/lib/core/application/security/Idempotency';
import { validateUserId } from '@/lib/core/application/security/InputSanitization';
import { recordHttpRequest } from '@/lib/core/application/observability/Metrics';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();

  try {
    // ============================================
    // RATE LIMITING
    // ============================================
    const rateLimitResult = checkRateLimit(req, RATE_LIMIT_PRESETS.standard);
    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded for session start', { traceId });
      recordHttpRequest('POST', '/api/sessions/start', 429, Date.now() - startTime);
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await req.json();

    // ============================================
    // INPUT VALIDATION
    // ============================================
    const userValidation = validateUserId(body.userId);
    if (!userValidation.valid) {
      logger.warn('Invalid userId for session start', { traceId, error: userValidation.error });
      recordHttpRequest('POST', '/api/sessions/start', 400, Date.now() - startTime);
      return NextResponse.json({ error: userValidation.error }, { status: 400 });
    }

    const { userId } = body;

    // ============================================
    // IDEMPOTENCY
    // ============================================
    const idempotencyKey = extractIdempotencyKey(req.headers);
    const fingerprint = createRequestFingerprint(body, userId);

    const result = await withIdempotency(
      idempotencyKey,
      fingerprint,
      async () => {
        const sessionResult = await startSessionUseCase.execute(userId);

        return {
          data: {
            sessionId: sessionResult.session.id,
            userId: sessionResult.session.userId,
            startedAt: sessionResult.session.startedAt,
            elevenLabsConfig: sessionResult.aiConfig,
          },
          statusCode: 201,
        };
      }
    );

    if (result.cached) {
      logger.info('Returning cached session start response', { traceId, idempotencyKey });
    }

    recordHttpRequest('POST', '/api/sessions/start', result.statusCode, Date.now() - startTime);

    const response = NextResponse.json(result.data, { status: result.statusCode });

    // Add rate limit headers
    for (const [key, value] of createRateLimitHeaders(rateLimitResult).entries()) {
      response.headers.set(key, value);
    }

    return response;

  } catch (error: any) {
    logger.error('Error starting session', {
      traceId,
      error: error.message
    });
    recordHttpRequest('POST', '/api/sessions/start', 500, Date.now() - startTime);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
}
