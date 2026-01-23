import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { z } from 'zod';

const scheduleSchema = z.object({
    petId: z.string().min(1, "Pet ID is required"),
    date: z.string().transform((str) => new Date(str)), // Expecting ISO string
    timeSlot: z.string().min(1, "Time slot is required"),
    location: z.string().min(1, "Location is required"),
    notes: z.string().optional(),
});

// GET /api/schedules - List schedules
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        let schedules;

        if (session.user.role === 'STAFF') {
            // Staff sees all schedules
            schedules = await prisma.schedule.findMany({
                include: {
                    pet: { select: { name: true, species: true } },
                    user: { select: { name: true, email: true } },
                },
                orderBy: { date: 'asc' },
            });
        } else {
            // Users see their own schedules
            schedules = await prisma.schedule.findMany({
                where: { userId: session.user.id },
                include: {
                    pet: { select: { name: true, species: true, imageUrl: true } },
                },
                orderBy: { date: 'asc' },
            });
        }

        return NextResponse.json({ schedules }, { status: 200 });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        return NextResponse.json(
            { error: 'Failed to fetch schedules' },
            { status: 500 }
        );
    }
}

// POST /api/schedules - Create schedule
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.role === 'STAFF') {
            return NextResponse.json(
                { error: 'Staff cannot schedule meetings for themselves right now.' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validatedData = scheduleSchema.parse(body);

        // Check for double booking
        const existingSchedule = await prisma.schedule.findFirst({
            where: {
                date: validatedData.date,
                timeSlot: validatedData.timeSlot,
                location: validatedData.location,
                status: { not: 'CANCELLED' } // Don't count cancelled
            }
        });

        if (existingSchedule) {
            return NextResponse.json(
                { error: 'This time slot and location is already booked.' },
                { status: 409 }
            );
        }

        const schedule = await prisma.schedule.create({
            data: {
                userId: session.user.id,
                petId: validatedData.petId,
                date: validatedData.date,
                timeSlot: validatedData.timeSlot,
                location: validatedData.location,
                notes: validatedData.notes,
                status: "PENDING"
            },
            include: {
                pet: true
            }
        });

        return NextResponse.json({ schedule }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error creating schedule:', error);
        return NextResponse.json(
            { error: 'Failed to create schedule' },
            { status: 500 }
        );
    }
}
