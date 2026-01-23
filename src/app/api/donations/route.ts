import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { z } from 'zod';

const donationSchema = z.object({
    amount: z.number().min(1, "Donation amount must be at least 1"),
    type: z.string().min(1, "Donation type is required"), // e.g., "FOOD", "MEDICAL"
    frequency: z.string().min(1, "Frequency is required"), // "ONE_TIME" or "MONTHLY"
});

// GET /api/donations
// - If "leaderboard=true", return top donors
// - Else return current user's donations
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const isLeaderboard = url.searchParams.get('leaderboard') === 'true';

        if (isLeaderboard) {
            // Aggregate donations by user
            const leaderboard = await prisma.donation.groupBy({
                by: ['userId'],
                _sum: {
                    amount: true,
                },
                orderBy: {
                    _sum: {
                        amount: 'desc',
                    },
                },
                take: 10,
            });

            // Populate user details (since groupBy doesn't include relations)
            // We need a separate query or manual fetch. prisma.donation.groupBy cannot modify relations directly.
            // Efficient way: Fetch users for these IDs.
            const userIds = leaderboard.map(entry => entry.userId);
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true, role: true }
            });

            const result = leaderboard.map(entry => {
                const user = users.find(u => u.id === entry.userId);
                return {
                    userId: entry.userId,
                    name: user?.name || 'Anonymous',
                    totalAmount: entry._sum.amount || 0,
                    role: user?.role
                };
            });

            return NextResponse.json({ leaderboard: result }, { status: 200 });

        } else {
            // My Donations
            const session = await getServerSession(authOptions);
            if (!session) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const donations = await prisma.donation.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({ donations }, { status: 200 });
        }

    } catch (error) {
        console.error('Error fetching donations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch donations' },
            { status: 500 }
        );
    }
}

// POST /api/donations - Create (Simulate payment)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Optionally restrict role? Adopters and Donors can donate. Staff too?
        // Let's allow everyone to donate.

        const body = await req.json();
        const validatedData = donationSchema.parse(body);

        const donation = await prisma.donation.create({
            data: {
                userId: session.user.id,
                amount: validatedData.amount,
                type: validatedData.type,
                frequency: validatedData.frequency
            }
        });

        // Trigger email or receipt logic here (mock)

        return NextResponse.json({ donation }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error creating donation:', error);
        return NextResponse.json(
            { error: 'Failed to create donation' },
            { status: 500 }
        );
    }
}
