import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If user is not logged in and trying to access protected route
    if (!token && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user is logged in and trying to access auth pages, redirect to appropriate portal
    if (token && (pathname === '/login' || pathname === '/register')) {
        const role = token.role as string;

        if (role === 'ADOPTER') {
            return NextResponse.redirect(new URL('/adopter/discover', request.url));
        } else if (role === 'STAFF') {
            return NextResponse.redirect(new URL('/staff/dashboard', request.url));
        } else if (role === 'DONOR') {
            return NextResponse.redirect(new URL('/donor/dashboard', request.url));
        }
    }

    // Role-based access control for portal routes
    if (token) {
        const role = token.role as string;

        if (pathname.startsWith('/adopter') && role !== 'ADOPTER') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        if (pathname.startsWith('/staff') && role !== 'STAFF') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        if (pathname.startsWith('/donor') && role !== 'DONOR') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
