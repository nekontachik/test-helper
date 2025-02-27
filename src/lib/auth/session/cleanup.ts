import { SessionManager } from './sessionManager';
import { AuditService } from '@/lib/audit/auditService';
import { AuditAction, AuditLogType } from '@/types/audit';

export async function cleanupSessions(): Promise<void> {
  try {
    const startTime = Date.now();
    await SessionManager.cleanupExpiredSessions();
    
    await AuditService.log({
      userId: 'system',
      type: AuditLogType.SYSTEM,
      action: AuditAction.SESSION_EXPIRED,
      metadata: {
        operation: 'session_cleanup',
        duration: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
    
    await AuditService.log({
      userId: 'system',
      type: AuditLogType.SYSTEM,
      action: AuditAction.SESSION_EXPIRED,
      metadata: {
        operation: 'session_cleanup',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
} 