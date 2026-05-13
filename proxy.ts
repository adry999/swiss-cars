import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Admin routes: verify auth session, redirect to /login if not authenticated
    if (pathname.startsWith('/admin')) {
        return await updateSession(request);
    }

    // API/login/auth routes: skip intl and auth
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/auth')
    ) {
        return NextResponse.next();
    }

    // Public routes: apply intl middleware only
    return intlMiddleware(request);
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)', ],
};
