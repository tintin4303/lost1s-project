import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';

// GET /api/pets - Get all available pets
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'AVAILABLE';
        const species = searchParams.get('species');

        const where: any = { status };
        if (species) {
            where.species = species;
        }

        const pets = await prisma.pet.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { applications: true },
                },
            },
        });

        return NextResponse.json({ pets }, { status: 200 });
    } catch (error) {
        console.error('Error fetching pets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pets' },
            { status: 500 }
        );
    }
}

// POST /api/pets - Create a new pet (Staff only)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'STAFF') {
            return NextResponse.json(
                { error: 'Unauthorized - Staff access required' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { name, species, breed, age, vaccinated, spayed, imageUrl, description } = body;

        const pet = await prisma.pet.create({
            data: {
                name,
                species,
                breed,
                age,
                vaccinated: vaccinated || false,
                spayed: spayed || false,
                imageUrl,
                description,
            },
        });

        return NextResponse.json({ pet }, { status: 201 });
    } catch (error) {
        console.error('Error creating pet:', error);
        return NextResponse.json(
            { error: 'Failed to create pet' },
            { status: 500 }
        );
    }
}
