import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MOCK_USER } from './simpleAuth';
import { logger } from '@/lib/utils/logger';

export function withSimpleAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async function authHandler(req: NextRequest) {
    try {
      // Attach mock user to request
      (req as any).user = MOCK_USER;
      
      // Log the request
      logger.debug({
        path: req.nextUrl.pathname,
        method: req.method,
        userId: MOCK_USER.id
      }, 'Authenticated request');

      return handler(req);
    } catch (error) {
      logger.error('Auth handler error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
} 