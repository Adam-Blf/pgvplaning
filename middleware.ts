import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('firebase-token')?.value;

  // List of protected routes that require authentication
  const protectedRoutes = ['/admin', '/team', '/settings', '/calendar', '/analytics', '/team-planner'];

  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If user is trying to access a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is accessing login page, but they already have a session, redirect to home
  if (request.nextUrl.pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
