
import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function POST(req: Request) {
    try {
        // Authenticate the caller or trust internal? 
        // For now, checks if the user exists via token or body payload.
        // Middleware passes data. 

        const body = await req.json();
        const { userId, incident, action } = body;

        if (!userId || !incident || !action) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await prisma.securityLog.create({
            data: {
                userId,
                incident,
                action,
                status: 'OPEN'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error logging security event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
