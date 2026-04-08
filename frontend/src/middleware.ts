import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register'];

// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/login', '/register'];

// Admin-only route prefixes
const ADMIN_ROUTES = ['/audit-logs'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('task_manager_token')?.value;

  // Also check Authorization header (for API-style requests)
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  const accessToken = token || bearerToken;

  // ── Public routes: allow through ──────────────────────────
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute && !accessToken) {
    return NextResponse.next();
  }

  // ── Verify JWT ────────────────────────────────────────────
  let payload: { sub?: string; role?: string } | null = null;

  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-256-bit-secret',
      );

      const { payload: verified } = await jwtVerify(accessToken, secret);
      payload = verified as { sub?: string; role?: string };
    } catch {
      // Token invalid or expired — treat as unauthenticated
      payload = null;
    }
  }

  // ── Authenticated user hitting auth pages → redirect to dashboard ─
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isAuthRoute && payload) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  // ── Protected routes: require valid token ─────────────────
  if (!isPublicRoute && !payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin routes: require ADMIN role ──────────────────────
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isAdminRoute && payload?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     * - API routes
     */
    '/((?!_next/static|_next/image|favicon\\.ico|public|api).*)',
  ],
};
