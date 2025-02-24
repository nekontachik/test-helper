import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
  };
}

export interface RouteParams {
  params: {
    id: string;
    [key: string]: string;
  };
}

type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  params: RouteParams
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, params: RouteParams) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: session.user.id,
        email: session.user.email ?? ''
      };

      return handler(authenticatedReq, params);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
} 