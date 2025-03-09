import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Main middleware entry point
 * @param request The incoming request
 * @returns The response from the middleware chain
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value;
          },
          set(name, value, options) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name, options) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    const url = new URL(request.url);

    // Auth routes - redirect to dashboard if already authenticated
    if (url.pathname.startsWith('/auth') && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Protected routes - redirect to login if not authenticated
    if (
      (url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/projects') ||
      url.pathname.startsWith('/settings')) && 
      !session
    ) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Check for admin access
    if (url.pathname.startsWith('/admin') && session && session.user.user_metadata.role !== 'ADMIN') {
      // Redirect to unauthorized page if not an admin
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
