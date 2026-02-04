
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/src/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
        // Resolve params
        const { id } = await params;

        if (!token || token.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update the log
        const updatedLog = await prisma.securityLog.update({
            where: { id: id },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date(),
                resolverId: token.id as string // Link to the Admin
            },
            include: {
                resolver: { select: { username: true } }
            }
        });

        return NextResponse.json(updatedLog);
    } catch (error) {
        console.error('Error resolving log:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
