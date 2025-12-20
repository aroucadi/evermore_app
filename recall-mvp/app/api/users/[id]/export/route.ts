import { NextRequest, NextResponse } from 'next/server';
import { exportBookUseCase } from '@/lib/infrastructure/di/container';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        // Verify user is asking for their own book or family member (Auth check skipped for now per MVP, assuming middleware or session check upstream)

        const pdfBuffer = await exportBookUseCase.execute(id);

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="life-story-${id}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error("Export failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
