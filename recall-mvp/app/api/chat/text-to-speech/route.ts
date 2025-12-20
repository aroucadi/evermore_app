import { NextRequest, NextResponse } from 'next/server';
import { speechProvider } from '@/lib/infrastructure/di/container';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, style } = body;

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const audioBuffer = await speechProvider.textToSpeech(text, style);

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length.toString(),
            }
        });

    } catch (error: any) {
        console.error("TTS failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
