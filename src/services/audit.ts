import { AuditLogData, AuditLogType } from '@/types/audit';
import { logger } from '@/lib/utils/logger';

/**
 * AuditLogger Service
 * 
 * Handles logging of audit events throughout the application.
 * Provides methods for logging different types of audit events
 * with proper error handling and type safety.
 */
export class AuditLogger {
  /**
   * Log an audit event
   * @param data The audit log data
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      // Log the audit event
      logger.info('Audit event', {
        userId: data.userId,
        type: data.type,
        action: data.action,
        metadata: data.metadata,
        timestamp: new Date().toISOString(),
      });

      // Here you would typically also save to database
      // await prisma.auditLog.create({
      //   data: {
      //     userId: data.userId,
      //     type: data.type,
      //     action: data.action,
      //     metadata: data.metadata,
      //   },
      // });

    } catch (error) {
      // Log the error but don't throw to prevent disrupting the main flow
      logger.error('Failed to log audit event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data,
      });
    }
  }

  /**
   * Log a security-related audit event
   * @param data The audit log data
   */
  static async logSecurityEvent(data: AuditLogData): Promise<void> {
    await this.log({
      ...data,
      type: AuditLogType.SYSTEM,
      metadata: {
        ...data.metadata,
        securityEvent: true,
      },
    });
  }

  /**
   * Log a user action audit event
   * @param data The audit log data
   */
  static async logUserAction(data: AuditLogData): Promise<void> {
    await this.log({
      ...data,
      type: AuditLogType.USER,
    });
  }
} 