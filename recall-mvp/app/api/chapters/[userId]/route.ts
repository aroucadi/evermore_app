import { getChaptersUseCase } from '@/lib/infrastructure/di/container';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const chapters = await getChaptersUseCase.execute(userId);
    return NextResponse.json(chapters); // Reverted to Array to match contract
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}
