import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED']),
});

// PATCH /api/schedules/[id] - Update status
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> } // Corrected context type for Next.js 15+
) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { status } = updateSchema.parse(body);

        const schedule = await prisma.schedule.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!schedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
        }

        // Logic checks
        if (session.user.role === 'ADOPTER') {
            if (schedule.userId !== session.user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            if (status !== 'CANCELLED') {
                return NextResponse.json({ error: 'Adopters can only cancel schedules' }, { status: 400 });
            }
        } else if (session.user.role === 'STAFF') {
            // Staff can set any status
        } else {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updated = await prisma.schedule.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ schedule: updated }, { status: 200 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error updating schedule:', error);
        return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
    }
}
