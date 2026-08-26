import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

// Framework metadata routes — these have no locale and must never be routed
// through next-intl. The matcher below already excludes common asset
// extensions but not .xml/.txt, so /sitemap.xml and /robots.txt were being
// rewritten under a locale prefix (/ro/sitemap.xml) by intlMiddleware and
// 404ing; the generated sitemap in app/sitemap.ts was unreachable by any
// crawler as a result.
const BYPASS_PATHS = new Set(['/sitemap.xml', '/robots.txt']);

export default async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (BYPASS_PATHS.has(pathname)) {
        return NextResponse.next();
    }

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
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|xml|txt)).*)', ],
};
