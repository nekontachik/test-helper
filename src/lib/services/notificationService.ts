import type { Notification } from '@/contexts/NotificationContext';
import { prisma } from '@/lib/prisma';

export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const dbNotifications = await prisma.notification.findMany({
      where: {
        userId,
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return dbNotifications.map(n => ({
      id: n.id,
      message: n.message,
      type: isValidNotificationType(n.type) ? n.type : 'info',
      createdAt: n.createdAt
    }));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export async function markAsRead(notificationId: string): Promise<void> {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true }
  });
} 