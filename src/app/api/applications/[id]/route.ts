import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';

// PATCH /api/applications/[id] - Update application status (Staff only)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'STAFF') {
            return NextResponse.json(
                { error: 'Unauthorized - Staff access required' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await req.json();
        const { status, notes } = body;

        const application = await prisma.application.update({
            where: { id },
            data: {
                status,
                // reviewNotes: notes, // Field deleted from schema
                // reviewedAt: new Date(), // Field deleted from schema
            },
            include: {
                pet: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // If approved, update pet status to ADOPTED
        if (status === 'APPROVED') {
            await prisma.pet.update({
                where: { id: application.petId },
                data: { status: 'ADOPTED' },
            });
        }

        return NextResponse.json({ application }, { status: 200 });
    } catch (error) {
        console.error('Error updating application:', error);
        return NextResponse.json(
            { error: 'Failed to update application' },
            { status: 500 }
        );
    }
}
