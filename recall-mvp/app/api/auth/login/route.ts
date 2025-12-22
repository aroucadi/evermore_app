import { NextRequest, NextResponse } from 'next/server';
import { signSession } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = await req.json();

    // In a real app, we would verify credentials here.
    // For MVP/Dev, we allow specific test users.
    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    // Basic whitelist for dev safety
    const allowedUsers = ['senior-1', 'family-1', 'admin'];
    if (!allowedUsers.includes(userId) && !userId.startsWith('test-')) {
        return NextResponse.json({ error: 'Invalid user for MVP login' }, { status: 403 });
    }

    const token = await signSession({ userId, role });

    const response = NextResponse.json({ success: true });

    // Set HTTP-only cookie
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
