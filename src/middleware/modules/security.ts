import type { NextResponse } from 'next/server';
import logger from '@/lib/logger';

/**
 * Security middleware module
 */
export class SecurityMiddleware {
  /**
   * Apply security headers to response
   */
  public static async applySecurityHeaders(response: NextResponse): Promise<NextResponse> {
    try {
      const { SecurityService } = await import('@/lib/security/securityService');
      
      // Add security headers
      const securityHeaders = SecurityService.getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    } catch (error) {
      logger.error('Security service error:', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Continue even if security service fails
      return response;
    }
  }
} 