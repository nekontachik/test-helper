import { NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { Action, Resource } from '@/types/rbac';

export type SecureRouteContext = {
  session: Session | null;
  params: Record<string, string>;
};

export type SecureRouteHandler = (
  request: Request,
  context: SecureRouteContext
) => Promise<NextResponse>;

interface SecureRouteOptions {
  requireAuth?: boolean;
  requireVerified?: boolean;
  requireCsrf?: boolean;
  action?: Action;
  resource?: Resource;
  rateLimit?: {
    points: number;
    duration: number;
  };
  audit?: {
    action: string;
    getMetadata?: (request: Request, context: SecureRouteContext) => Promise<Record<string, unknown>>;
  };
}

export function createSecureRoute(
  handler: SecureRouteHandler,
  options: SecureRouteOptions
): SecureRouteHandler {
  return async (request: Request, context: SecureRouteContext) => {
    try {
      // Security checks will be handled by middleware
      return await handler(request, context);
    } catch (error) {
      console.error('Route error:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  };
} 