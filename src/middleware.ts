import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isSignInPage = req.nextUrl.pathname === '/auth/signin';
    const isSignUpPage = req.nextUrl.pathname === '/auth/signup';
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');
    const isPublicRoute = req.nextUrl.pathname.startsWith('/_next') || 
                         req.nextUrl.pathname.startsWith('/static');
    const isRootPath = req.nextUrl.pathname === '/';

    // Redirect unauthenticated users to signup
    if (!isAuth && isSignInPage) {
      return NextResponse.redirect(new URL('/auth/signup', req.url));
    }

    // Always redirect root path to signup for unauthenticated users
    if (!isAuth && (isRootPath || !isAuthPage && !isApiRoute && !isPublicRoute)) {
      return NextResponse.redirect(new URL('/auth/signup', req.url));
    }

    // Redirect authenticated users away from auth pages
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/projects', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle the logic
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/projects/:path*',
    '/account/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
