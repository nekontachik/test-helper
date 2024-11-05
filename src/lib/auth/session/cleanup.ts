import { SessionManager } from './sessionManager';
import { AuditService, AuditAction } from '@/lib/audit/auditService';

export async function cleanupSessions() {
  try {
    const startTime = Date.now();
    await SessionManager.cleanupExpiredSessions();
    
    await AuditService.log({
      userId: 'system',
      action: AuditAction.SYSTEM,
      metadata: {
        operation: 'session_cleanup',
        duration: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
    
    await AuditService.log({
      userId: 'system',
      action: AuditAction.SYSTEM,
      metadata: {
        operation: 'session_cleanup',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
} 