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

        // Get total adopters count
        const totalAdopters = await prisma.user.count({
            where: { role: 'ADOPTER' },
        });

        // Get security alerts count (blacklisted users)
        const securityAlerts = await prisma.user.count({
            where: { isBlacklisted: true },
        });

        return NextResponse.json({
            totalPets,
            pendingApplications,
            totalAdopters,
            securityAlerts,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
