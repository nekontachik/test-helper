import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

interface SessionActivity {
  userId: string;
  action: string;
  path: string;
  userAgent?: string;
  ip?: string;
}

export async function trackSessionActivity(activity: SessionActivity): Promise<void> {
  try {
    // Log the activity
    logger.info('Session activity', activity);
    
    // Store in database (optional)
    await prisma.userActivity.create({
      data: {
        userId: activity.userId,
        action: activity.action,
        path: activity.path,
        userAgent: activity.userAgent || 'unknown',
        ip: activity.ip || 'unknown',
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Failed to track session activity', { error, activity });
  }
}

export async function getSessionHistory(userId: string, limit = 10): Promise<any[]> {
  try {
    const activities = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
    
    return activities;
  } catch (error) {
    logger.error('Failed to get session history', { error, userId });
    return [];
  }
} 