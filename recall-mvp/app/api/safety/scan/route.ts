import { NextRequest, NextResponse } from 'next/server';
import { DrizzleAlertRepository } from '@/lib/infrastructure/adapters/db/DrizzleAlertRepository';
import { DrizzleUserRepository } from '@/lib/infrastructure/adapters/db/DrizzleUserRepository';
import { ConsoleEmailService } from '@/lib/infrastructure/adapters/email/ConsoleEmailService';
import { SafetyMonitorService } from '@/lib/core/application/services/SafetyMonitorService';

const alertRepository = new DrizzleAlertRepository();
const userRepository = new DrizzleUserRepository();
const emailService = new ConsoleEmailService();
const safetyMonitorService = new SafetyMonitorService(alertRepository, userRepository, emailService);

export async function POST(req: NextRequest) {
  try {
    const { seniorId, sessionId, text } = await req.json();

    if (!seniorId || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const alert = await safetyMonitorService.scanMessage(seniorId, sessionId, text);

    if (alert) {
        // In a real system, we would trigger email/SMS here immediately.
        console.log(`[SAFETY ALERT] Triggered for user ${seniorId}: ${alert.content}`);
    }

    return NextResponse.json({ alert });
  } catch (error: any) {
    console.error('Error scanning message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
