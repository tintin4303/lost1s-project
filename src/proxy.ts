import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
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

        // Redirect from auth pages to appropriate portal
        if (role === 'ADOPTER') {
            return NextResponse.redirect(new URL('/adopter/discover', request.url));
        } else if (role === 'STAFF') {
            return NextResponse.redirect(new URL('/staff/dashboard', request.url));
        } else if (role === 'DONOR') {
            return NextResponse.redirect(new URL('/donor/dashboard', request.url));
        } else if (role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    // Role-based access control for portal routes
    if (token) {
        const role = token.role as string;
        const additionalRole = token.additionalRole as string | null;

        if (pathname.startsWith('/adopter') && role !== 'ADOPTER' && additionalRole !== 'ADOPTER') {
            // Log security event
            await fetch(new URL('/api/internal/log-security', request.url), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: token.id,
                    incident: 'UNAUTHORIZED_ACCESS',
                    action: `User ${token.name || token.email} [${role}] attempted to access /adopter`
                })
            }).catch(e => console.error('Failed to log unauthorized access:', e));

            return NextResponse.redirect(new URL('/', request.url));
        }
        if (pathname.startsWith('/staff') && role !== 'STAFF') {
            // Log security event
            await fetch(new URL('/api/internal/log-security', request.url), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: token.id,
                    incident: 'UNAUTHORIZED_ACCESS',
                    action: `User ${token.name || token.email} [${role}] attempted to access /staff`
                })
            }).catch(e => console.error('Failed to log unauthorized access:', e));

            return NextResponse.redirect(new URL('/', request.url));
        }
        if (pathname.startsWith('/donor') && role !== 'DONOR' && additionalRole !== 'DONOR') {
            // Log security event
            await fetch(new URL('/api/internal/log-security', request.url), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: token.id,
                    incident: 'UNAUTHORIZED_ACCESS',
                    action: `User ${token.name || token.email} [${role}] attempted to access /donor`
                })
            }).catch(e => console.error('Failed to log unauthorized access:', e));

            return NextResponse.redirect(new URL('/', request.url));
        }
        if (pathname.startsWith('/admin') && role !== 'ADMIN') {
            // Log security event
            await fetch(new URL('/api/internal/log-security', request.url), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: token.id,
                    incident: 'UNAUTHORIZED_ACCESS',
                    action: `User ${token.name || token.email} [${role}] attempted to access /admin`
                })
            }).catch(e => console.error('Failed to log unauthorized access:', e));

            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
