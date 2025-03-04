import type { Notification } from '@/contexts/NotificationContext';
import { prisma } from '@/lib/prisma';

// Valid notification types
type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Validates if the provided type is a valid notification type
 */
function isValidNotificationType(type: string): type is NotificationType {
  return ['info', 'success', 'warning', 'error'].includes(type);
}

/**
 * Get unread notifications for a user
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    // Use raw query to get notifications since the Prisma client might not be properly generated
    const dbNotifications = await prisma.$queryRaw`
      SELECT id, userId, message, type, read, createdAt
      FROM Notification
      WHERE userId = ${userId} AND read = 0
      ORDER BY createdAt DESC
    `;

    // Type assertion for the raw query result
    return (dbNotifications as Array<{
      id: string;
      message: string;
      type: string;
      read: boolean;
      createdAt: Date;
    }>).map((n) => ({
      id: n.id,
      message: n.message,
      type: isValidNotificationType(n.type) ? n.type : 'info',
      read: n.read,
      createdAt: n.createdAt
    }));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  // Use raw query to update notification
  await prisma.$executeRaw`
    UPDATE Notification
    SET read = 1
    WHERE id = ${notificationId}
  `;
} 