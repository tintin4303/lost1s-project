import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { z } from 'zod';

const applicationSchema = z.object({
    petId: z.string(),
    reason: z.string().min(50, 'Please provide at least 50 characters explaining why you want to adopt'),
    experience: z.string().min(20, 'Please describe your experience with pets'),
    housing: z.enum(['HOUSE', 'APARTMENT', 'CONDO', 'OTHER']),
    hasYard: z.boolean(),
});

// GET /api/applications - Get user's applications or all applications (staff)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        let applications;

        if (session.user.role === 'STAFF') {
            // Staff can see all applications
            const rawApplications = await prisma.application.findMany({
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
                orderBy: { createdAt: 'desc' },
            });

            // Map database fields to UI-expected fields
            applications = rawApplications.map(app => ({
                ...app,
                reason: app.lifestyle, // Map lifestyle to reason
                experience: '', // Not stored in current schema
                housing: app.housingType, // Map housingType to housing
            }));
        } else {
            // Users can only see their own applications
            const rawApplications = await prisma.application.findMany({
                where: { userId: session.user.id },
                include: {
                    pet: true,
                },
                orderBy: { createdAt: 'desc' },
            });

            // Map database fields to UI-expected fields
            applications = rawApplications.map(app => ({
                ...app,
                reason: app.lifestyle, // Map lifestyle to reason
                experience: '', // Not stored in current schema
                housing: app.housingType, // Map housingType to housing
            }));
        }

        return NextResponse.json({ applications }, { status: 200 });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications' },
            { status: 500 }
        );
    }
}

// POST /api/applications - Submit new application
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.role !== 'ADOPTER') {
            return NextResponse.json(
                { error: 'Only adopters can submit applications' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validatedData = applicationSchema.parse(body);

        // Check if user already has a pending application for this pet
        // Temporarily disabled due to enum mismatch
        // const existingApplication = await prisma.application.findFirst({
        //     where: {
        //         userId: session.user.id,
        //         petId: validatedData.petId,
        //         status: { in: ['REVIEW', 'APPROVED'] },
        //     },
        // });

        // if (existingApplication) {
        //     return NextResponse.json(
        //         { error: 'You already have an active application for this pet' },
        //         { status: 400 }
        //     );
        // }

        const application = await prisma.application.create({
            data: {
                userId: session.user.id,
                petId: validatedData.petId,
                reason: validatedData.reason,
                experience: validatedData.experience,
                housingType: validatedData.housing,
                hasYard: validatedData.hasYard,
            },
            include: {
                pet: true,
            },
        });

        return NextResponse.json({ application }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error creating application:', error);
        return NextResponse.json(
            { error: 'Failed to create application' },
            { status: 500 }
        );
    }
}
