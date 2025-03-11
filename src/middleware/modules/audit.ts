import { logger } from '@/lib/logger';
import type { AccessTokenPayload } from '@/types/auth/tokens';
import { AuditLogType } from '@/types/audit';

/**
 * Request metadata for logging
 */
export interface RequestMetadata {
  path: string;
  method: string;
  ip: string;
  userAgent: string;
}

/**
 * Audit middleware module
 */
export class AuditMiddleware {
  /**
   * Log request to audit system
   */
  public static async logRequest(
    token: AccessTokenPayload, 
    metadata: RequestMetadata
  ): Promise<void> {
    try {
      // Import AuditService dynamically to avoid circular dependencies
      const { AuditService } = await import('@/lib/audit/auditService');
      
      await AuditService.log({
        userId: token.sub,
        action: 'API_REQUEST',
        type: AuditLogType.SYSTEM,
        metadata: {
          path: metadata.path,
          method: metadata.method,
        },
        context: {
          ip: metadata.ip,
          userAgent: metadata.userAgent
        },
        status: 'SUCCESS'
      });
    } catch (error) {
      logger.error('Failed to log request', {
        error: error instanceof Error ? error.message : String(error),
        userId: token.sub,
        path: metadata.path
      });
    }
  }
} 