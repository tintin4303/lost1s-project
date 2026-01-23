import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Delete the user
        // This will TRIGGER CASCADE DELETE for all related Applications, Schedules, Donations, etc.
        // proving the Total Participation constraint (Weak Entities cannot exist without Owner)
        await prisma.user.delete({
            where: { id: session.user.id },
        });

        return NextResponse.json(
            { message: 'Account deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete account' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { role } = body;

        // Only allow switching/enabling between ADOPTER and DONOR
        if (role !== 'ADOPTER' && role !== 'DONOR') {
            return NextResponse.json(
                { error: 'Invalid role change. Only ADOPTER and DONOR roles are allowed.' },
                { status: 400 }
            );
        }

        // Prevent STAFF from changing their role via this endpoint
        if (session.user.role === 'STAFF') {
            return NextResponse.json(
                { error: 'Staff members cannot change their role.' },
                { status: 403 }
            );
        }

        // Logic: 
        // 1. If requested role is same as primary role, do nothing.
        // 2. Otherwise update 'additionalRole'.

        // Fetch current user to check existing roles
        const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });

        // If the requested role is already the primary role, do nothing
        if (currentUser?.role === role) {
            return NextResponse.json({ user: currentUser }, { status: 200 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                additionalRole: role
            },
        });

        return NextResponse.json({ user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
            { error: 'Failed to update role' },
            { status: 500 }
        );
    }
}
