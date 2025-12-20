import { NextRequest, NextResponse } from 'next/server';
import { userProfileUpdater } from '@/lib/infrastructure/di/container';

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
    const { id, updates, type } = await req.json();

    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Security: Input validation to prevent Mass Assignment
    let sanitizedUpdates;

    let updatedUser;
    if (type === 'senior') {
        sanitizedUpdates = sanitizeUpdates(updates, SENIOR_ALLOWED_FIELDS);
        updatedUser = await userProfileUpdater.updateSeniorProfile(id, sanitizedUpdates);
    } else if (type === 'family') {
        sanitizedUpdates = sanitizeUpdates(updates, FAMILY_ALLOWED_FIELDS);
        updatedUser = await userProfileUpdater.updateFamilyProfile(id, sanitizedUpdates);
    } else {
        return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
