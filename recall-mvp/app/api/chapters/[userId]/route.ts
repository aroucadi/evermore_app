import { getChaptersUseCase } from '@/lib/infrastructure/di/container';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // SECURITY: Get the authenticated user ID from headers (injected by middleware)
    const authenticatedUserId = req.headers.get('x-user-id');
    const { userId } = await params;

    // SECURITY: Ensure the user is authenticated
    if (!authenticatedUserId) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // SECURITY: Broken Object Level Authorization (BOLA/IDOR) Prevention
    // Ensure the authenticated user can only access their own chapters.
    if (authenticatedUserId !== userId) {
        // FUTURE: If family members need access, check x-user-role === 'family' AND
        // verify the relationship (e.g. via familyService.isConnected(authenticatedUserId, userId))
        // For now, strict ownership is enforced to prevent data leaks.
        return NextResponse.json(
            { error: 'Forbidden: You can only view your own chapters' },
            { status: 403 }
        );
    }

    const chapters = await getChaptersUseCase.execute(userId);
    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}
