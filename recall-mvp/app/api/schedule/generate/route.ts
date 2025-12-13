import { NextRequest, NextResponse } from 'next/server';
import { DrizzleUserRepository } from '@/lib/infrastructure/adapters/db/DrizzleUserRepository';
import { DrizzleInvitationRepository } from '@/lib/infrastructure/adapters/db/DrizzleInvitationRepository';
import { SchedulingService } from '@/lib/core/application/services/SchedulingService';

const userRepository = new DrizzleUserRepository();
const invitationRepository = new DrizzleInvitationRepository();
const schedulingService = new SchedulingService(userRepository, invitationRepository);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const invitations = await schedulingService.generateScheduleForUser(userId);

    return NextResponse.json({
        message: `Generated ${invitations.length} invitations`,
        invitations
    });
  } catch (error: any) {
    console.error('Error generating schedule:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
