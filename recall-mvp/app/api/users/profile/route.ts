import { NextRequest, NextResponse } from 'next/server';
import { userProfileUpdater } from '@/lib/infrastructure/di/container';
import { logger } from '@/lib/core/application/Logger';

// Allowed fields for senior updates (whitelist)
const SENIOR_ALLOWED_FIELDS = [
  'conversationSchedule',
  'voiceTone',
  'topicsLove',
  'topicsAvoid',
  'emergencyContact',
  'timezone'
];

// Allowed fields for family updates (whitelist)
const FAMILY_ALLOWED_FIELDS = [
  'seniorId'
];

function sanitizeUpdates(updates: any, allowedFields: string[]) {
  const sanitized: any = {};
  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      sanitized[key] = updates[key];
    }
  }
  return sanitized;
}

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Read User ID from the header injected by middleware
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (!userId) {
       // Should be caught by middleware, but double check
       return NextResponse.json({ error: 'Unauthorized: Missing User Context' }, { status: 401 });
    }

    const { updates, type } = await req.json();

    if (!updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Security: Input validation to prevent Mass Assignment
    let sanitizedUpdates;
    let updatedUser;

    // Use the authenticated ID, ignore any ID in the body
    const targetId = userId;

    // Validate that the user is updating their own profile type
    // (A senior can't update as family, etc.)
    if (type === 'senior') {
        if (userRole !== 'senior') {
             return NextResponse.json({ error: 'Forbidden: Role Mismatch' }, { status: 403 });
        }
        sanitizedUpdates = sanitizeUpdates(updates, SENIOR_ALLOWED_FIELDS);
        updatedUser = await userProfileUpdater.updateSeniorProfile(targetId, sanitizedUpdates);
    } else if (type === 'family') {
        if (userRole !== 'family') {
             return NextResponse.json({ error: 'Forbidden: Role Mismatch' }, { status: 403 });
        }
        sanitizedUpdates = sanitizeUpdates(updates, FAMILY_ALLOWED_FIELDS);
        updatedUser = await userProfileUpdater.updateFamilyProfile(targetId, sanitizedUpdates);
    } else {
        return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    logger.error('Error updating profile', { error: error.message, userId: req.headers.get('x-user-id') });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
