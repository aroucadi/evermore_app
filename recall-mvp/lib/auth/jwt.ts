import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod-unless-changed';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signSession(payload: { userId: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as { userId: string; role: string };
  } catch (error) {
    return null;
  }
}
