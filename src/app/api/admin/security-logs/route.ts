
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/src/lib/prisma';

export async function GET(req: Request) {
    try {
        const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

        if (!token || token.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const logs = await prisma.securityLog.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                },
                resolver: {
                    select: { username: true } // Admin username
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
