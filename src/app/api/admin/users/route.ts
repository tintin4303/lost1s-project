
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/src/lib/prisma';

export async function GET(req: Request) {
    try {
        // 1. Verify Authentication & Role
        const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

        if (!token || token.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                additionalRole: true,
                isBlacklisted: true,
                createdAt: true,
                _count: {
                    select: {
                        applications: true,
                        donations: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
