import { NextRequest, NextResponse } from 'next/server';
import { speechProvider } from '@/lib/infrastructure/di/container';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = file.type || 'audio/wav';

        const text = await speechProvider.speechToText(buffer, contentType);
        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("STT failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
