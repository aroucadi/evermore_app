import { SignJWT, jwtVerify } from 'jose';

// SECURITY: Environment-aware JWT secret handling
// - Production: MUST have JWT_SECRET env var (min 32 chars) or fails at RUNTIME
// - Development: Falls back to dev secret for local testing
// - Build: Defers validation to prevent build failures
const DEV_SECRET = 'dev-secret-for-local-testing-only-32chars!';

// Lazy-initialized key to avoid build-time failures
let _key: Uint8Array | null = null;

function getKey(): Uint8Array {
  if (_key) return _key;

  const envSecret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

  // During build, use dev secret to allow compilation
  if (isBuildTime) {
    _key = new TextEncoder().encode(DEV_SECRET);
    return _key;
  }

  if (envSecret && envSecret.length >= 32) {
    _key = new TextEncoder().encode(envSecret);
    return _key;
  }

  if (isProduction) {
    // CRITICAL: Fail loudly in production RUNTIME - do not allow startup with weak/missing secret
    throw new Error(
      'FATAL: JWT_SECRET environment variable is required in production (minimum 32 characters). ' +
      'Set a strong, random secret via environment variables.'
    );
  }

  // Development fallback - safe for local testing
  console.warn('[Security] Using development JWT secret. Set JWT_SECRET in production.');
  _key = new TextEncoder().encode(DEV_SECRET);
  return _key;
}

export async function signSession(payload: { userId: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getKey());
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, getKey());
    return payload as { userId: string; role: string };
  } catch (error) {
    return null;
  }
}

