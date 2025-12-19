import { NextRequest, NextResponse } from 'next/server';
import { ProcessMessageUseCase } from '@/lib/core/application/use-cases/ProcessMessageUseCase';
import { container } from '@/lib/infrastructure/di/container';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId, message } = body;

        if (!sessionId || !message) {
            return NextResponse.json({ error: 'Missing sessionId or message' }, { status: 400 });
        }

        const processMessageUseCase = container.resolve<ProcessMessageUseCase>('processMessageUseCase');
        const response = await processMessageUseCase.execute(sessionId, message, 'user');

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
