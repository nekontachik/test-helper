import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from "@/types/auth";

// Define routes that don't require authentication
const publicRoutes = [
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/api/auth",
];

// Define role-based route permissions
const rolePermissions: Record<string, UserRole[]> = {
  "/api/projects": [UserRole.USER, UserRole.ADMIN],
  "/api/projects/create": [UserRole.ADMIN],
  "/api/test-cases": [UserRole.TESTER, UserRole.ADMIN],
  "/api/test-runs": [UserRole.TESTER, UserRole.ADMIN],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check role-based permissions
  const userRole = token.role as UserRole;
  const requiredRoles = Object.entries(rolePermissions).find(([route]) => 
    pathname.startsWith(route)
  )?.[1];

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return new NextResponse(JSON.stringify({ 
      error: "Insufficient permissions" 
    }), { 
      status: 403,
      headers: { 'content-type': 'application/json' }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
