import { NextRequest, NextResponse } from 'next/server';
import { userProfileUpdater } from '@/lib/infrastructure/di/container';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { topicsAvoid } = body;

        // We assume the user calling this is a senior or family member authorized to update preferences.
        // For MVP, we allow updates to preferences.
        // The service method expects a partial of preferences.
        const updatedUser = await userProfileUpdater.updateSeniorProfile(id, { topicsAvoid });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error('Preferences API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await userProfileUpdater.getProfile(id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user.preferences || {});
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
