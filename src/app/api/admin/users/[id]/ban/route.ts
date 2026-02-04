
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/src/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1. Verify Authentication & Role
        const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
        // Resolve params
        const { id } = await params;

        if (!token || token.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();
        const { isBlacklisted } = body;

        if (typeof isBlacklisted !== 'boolean') {
            return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
        }

        // 3. Update User
        // If banning (true), set bannedById to current admin. If unbanning (false), clear it.
        const updateData: any = {
            isBlacklisted,
            bannedById: isBlacklisted ? (token.id as string) : null,
        };

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: updateData,
        });

        // LOG: Create Security Log if user is being banned
        if (isBlacklisted) {
            await prisma.securityLog.create({
                data: {
                    userId: id, // The user being banned
                    incident: 'USER_BANNED',
                    action: `Admin banned User ${updatedUser.name}`,
                    status: 'RESOLVED', // Auto-resolved since it's an action taken by admin
                    resolverId: token.id as string,
                    resolvedAt: new Date(),
                }
            });
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
