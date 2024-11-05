import { prisma } from '@/lib/prisma';
import { AuditAction, AuditLogType, AuditLogData } from '@/types/audit';
import logger from '@/lib/logger';
import type { Prisma } from '@prisma/client';

// Add caching for better performance
const logCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 100; // Number of logs to process in batch
const MAX_METADATA_SIZE = 1024 * 10; // 10KB limit for metadata

// Batch processing queue
let logQueue: Array<Prisma.ActivityLogCreateManyInput> = [];
let queueTimeout: NodeJS.Timeout | null = null;

/**
 * Service for handling audit logging functionality
 */
export class AuditService {
  /**
   * Creates an audit log entry
   * @param data - Audit log data
   * @throws Error if metadata size exceeds limit
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      // Validate metadata size
      const metadataString = data.metadata ? JSON.stringify(data.metadata) : null;
      if (metadataString && metadataString.length > MAX_METADATA_SIZE) {
        throw new Error('Metadata size exceeds limit');
      }

      const logData: Prisma.ActivityLogCreateManyInput = {
        type: data.type,
        action: data.action,
        userId: data.userId,
        targetId: data.targetId,
        metadata: metadataString,
        ipAddress: data.context?.ip,
        userAgent: data.context?.userAgent,
        location: data.context?.location,
      };

      // Add to batch queue
      logQueue.push(logData);

      // Process queue if it reaches batch size or after timeout
      if (logQueue.length >= BATCH_SIZE) {
        await this.processLogQueue();
      } else if (!queueTimeout) {
        queueTimeout = setTimeout(() => this.processLogQueue(), 1000);
      }

      logger.info('Audit log queued', {
        userId: data.userId,
        action: data.action,
        type: data.type,
      });
    } catch (error) {
      logger.error('Failed to queue audit log:', error);
      // Don't throw - audit logging should not break main flow
    }
  }

  /**
   * Process queued logs in batch
   */
  private static async processLogQueue(): Promise<void> {
    if (queueTimeout) {
      clearTimeout(queueTimeout);
      queueTimeout = null;
    }

    if (logQueue.length === 0) return;

    const logsToProcess = [...logQueue];
    logQueue = [];

    try {
      await prisma.$transaction(async (tx) => {
        await tx.activityLog.createMany({
          data: logsToProcess,
        });
      });
    } catch (error) {
      logger.error('Failed to process audit log batch:', error);
      // Re-queue failed logs
      logQueue = [...logsToProcess, ...logQueue];
    }
  }

  /**
   * Retrieves audit logs for a specific user with caching
   */
  static async getUserLogs(userId: string, limit = 50): Promise<AuditLogData[]> {
    try {
      const cacheKey = `user_logs:${userId}:${limit}`;
      const cached = logCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const logs = await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      const formattedLogs = this.formatLogs(logs);
      logCache.set(cacheKey, {
        data: formattedLogs,
        timestamp: Date.now(),
      });

      return formattedLogs;
    } catch (error) {
      logger.error('Failed to get user audit logs:', error);
      throw error;
    }
  }

  /**
   * Retrieves system-level audit logs
   * @param limit - Maximum number of logs to return
   * @returns Array of audit log entries
   */
  static async getSystemLogs(limit = 100): Promise<AuditLogData[]> {
    try {
      const cacheKey = `system_logs:${limit}`;
      const cached = logCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const logs = await prisma.activityLog.findMany({
        where: { type: 'SYSTEM' },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      const formattedLogs = this.formatLogs(logs);
      logCache.set(cacheKey, {
        data: formattedLogs,
        timestamp: Date.now(),
      });

      return formattedLogs;
    } catch (error) {
      logger.error('Failed to get system audit logs:', error);
      throw error;
    }
  }

  /**
   * Formats raw log data into AuditLogData format
   * @param logs - Raw log data from database
   * @returns Formatted audit log entries
   */
  private static formatLogs(logs: any[]): AuditLogData[] {
    return logs.map(log => ({
      type: log.type as AuditLogType,
      action: log.action as AuditAction,
      userId: log.userId,
      targetId: log.targetId || undefined,
      metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
      context: {
        ip: log.ipAddress || undefined,
        userAgent: log.userAgent || undefined,
        location: log.location || undefined,
      },
    }));
  }

  // Clean up expired cache entries periodically
  static {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of logCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          logCache.delete(key);
        }
      }
    }, CACHE_TTL);
  }
}

export { AuditAction, type AuditLogData };