import { NextRequest, NextResponse } from 'next/server';
import { DrizzleUserRepository } from '@/lib/infrastructure/adapters/db/DrizzleUserRepository';
import { UserProfileService } from '@/lib/core/application/services/UserProfileService';

const userRepository = new DrizzleUserRepository();
const userProfileService = new UserProfileService(userRepository);

export async function POST(req: NextRequest) {
  try {
    const { id, updates, type } = await req.json();

    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let updatedUser;
    if (type === 'senior') {
        updatedUser = await userProfileService.updateSeniorProfile(id, updates);
    } else if (type === 'family') {
        updatedUser = await userProfileService.updateFamilyProfile(id, updates);
    } else {
        return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
