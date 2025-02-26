import { prisma } from '@/lib/prisma';
import type { AuditLogType} from '@/types/audit';
import { AuditAction, type AuditLogData } from '@/types/audit';
import logger from '@/lib/logger';

export class AuditService {
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          userId: data.userId,
          type: data.type,
          action: data.action,
          metadata: JSON.stringify({
            ...data.metadata,
            ip: data.context?.ip,
            userAgent: data.context?.userAgent,
          }),
        },
      });
    } catch (error) {
      logger.error('Failed to create audit log:', {
        error,
        data,
      });
    }
  }

  static async getAuditLogs(userId: string, type?: AuditLogType) {
    return prisma.activityLog.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}