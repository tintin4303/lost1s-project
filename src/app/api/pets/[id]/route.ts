import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';

// GET /api/pets/[id] - Get single pet
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const pet = await prisma.pet.findUnique({
            where: { id },
            include: {
                applications: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!pet) {
            return NextResponse.json(
                { error: 'Pet not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ pet }, { status: 200 });
    } catch (error) {
        console.error('Error fetching pet:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pet' },
            { status: 500 }
        );
    }
}

// PATCH /api/pets/[id] - Update pet (Staff only)
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

        const pet = await prisma.pet.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({ pet }, { status: 200 });
    } catch (error) {
        console.error('Error updating pet:', error);
        return NextResponse.json(
            { error: 'Failed to update pet' },
            { status: 500 }
        );
    }
}
