import { getToken } from 'next-auth/jwt';
import logger from '@/lib/logger';
import { createErrorResponse, ErrorType } from '@/lib/utils/errorResponse';
import type { AuthResult, AuthErrorResult } from './types';
import { isAccessTokenPayload } from './guards';

/**
 * Check authentication for a request
 * Extracts and validates the token from the request
 */
export async function checkAuthentication(request: Request): Promise<AuthResult | AuthErrorResult> {
  try {
    // Get token from request using next-auth's getToken
    // The type casting is necessary because next-auth expects a NextApiRequest or NextRequest
    const token = await getToken({ 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req: request as unknown as any
    });
    
    if (!token || !isAccessTokenPayload(token)) {
      return {
        response: createErrorResponse({
          status: 401,
          type: ErrorType.AUTHENTICATION,
          message: 'Invalid or missing authentication token'
        })
      };
    }
    
    // Get request metadata
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    return {
      token,
      ip,
      userAgent
    };
  } catch (error) {
    logger.error('Authentication error:', {
      error: error instanceof Error ? error.message : String(error),
      path: new URL(request.url).pathname
    });
    
    return {
      response: createErrorResponse({
        status: 401,
        type: ErrorType.AUTHENTICATION,
        message: 'Authentication failed'
      })
    };
  }
} 