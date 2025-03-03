import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { UserActivity } from '@prisma/client';

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
        type: activity.action,
        userAgent: activity.userAgent || 'unknown',
        ipAddress: activity.ip || 'unknown',
        details: JSON.stringify({ path: activity.path })
      }
    });
  } catch (error) {
    logger.error('Failed to track session activity', { error, activity });
  }
}

export async function getSessionHistory(userId: string, limit = 10): Promise<UserActivity[]> {
  try {
    const activities = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    return activities;
  } catch (error) {
    logger.error('Failed to get session history', { error, userId });
    return [];
  }
} 