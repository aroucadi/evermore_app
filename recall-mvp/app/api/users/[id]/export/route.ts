import { NextRequest, NextResponse } from 'next/server';
import { exportBookUseCase } from '@/lib/infrastructure/di/container';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const userId = request.headers.get('x-user-id');

        // Security: Ensure the requesting user is the owner of the data
        if (!userId || userId !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const pdfBuffer = await exportBookUseCase.execute(id);

        // Convert Buffer to Blob for strict type compatibility with NextResponse BodyInit
        // Explicitly cast to any to bypass the Buffer/ArrayBuffer mismatch in strict mode
        const blob = new Blob([pdfBuffer as any], { type: 'application/pdf' });

        return new NextResponse(blob, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="life-story-${id}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error("Export failed:", error);
        // Security: Return generic error message to client
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
