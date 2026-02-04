import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'STAFF') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get total pets count
        const totalPets = await prisma.pet.count();

        // Get pending applications count
        const pendingApplications = await prisma.application.count({
            where: { status: 'REVIEW' },
        });

        // Get pending schedules count
        const pendingSchedules = await prisma.schedule.count({
            where: { status: 'PENDING' },
        });

        // Get 5 recent applications
        const recentApplications = await prisma.application.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                pet: { select: { name: true, imageUrl: true } },
                user: { select: { name: true, email: true } }
            }
        });

        return NextResponse.json({
            totalPets,
            pendingApplications,
            pendingSchedules,
            recentApplications,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
