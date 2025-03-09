import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { SessionCleanupConfig, SessionWhereInput } from '@/types/session';

const DEFAULT_CONFIG: SessionCleanupConfig = {
  interval: 24 * 60 * 60 * 1000, // 24 hours
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export class SessionCleanup {
  private config: SessionCleanupConfig;
  private timer: NodeJS.Timeout | null = null;

  constructor(config: Partial<SessionCleanupConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  public start(): void {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      this.cleanup().catch(error => {
        logger.error('Session cleanup failed:', error);
      });
    }, this.config.interval);

    // Run initial cleanup
    this.cleanup().catch(error => {
      logger.error('Initial session cleanup failed:', error);
    });
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer as NodeJS.Timeout);
      this.timer = null;
    }
  }

  private async cleanup(): Promise<void> {
    const now = new Date();
    const expiredBefore = new Date(now.getTime() - this.config.maxAge);

    const where: SessionWhereInput = {
      expiresAt: {
        lt: expiredBefore,
      },
    };

    try {
      const { count } = await prisma.session.deleteMany({
        where,
      });

      logger.info(`Cleaned up ${count} expired sessions`);
    } catch (error) {
      logger.error('Error cleaning up sessions:', error);
      throw error;
    }
  }
}

// Export singleton instance with default config
export const sessionCleanup = new SessionCleanup();