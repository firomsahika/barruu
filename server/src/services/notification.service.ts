import { prisma } from '../lib/prisma';
import { io } from '../index';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  static async createNotification({
    userId,
    actorId,
    type,
    message,
    link,
  }: {
    userId: string;
    actorId?: string;
    type: NotificationType;
    message: string;
    link?: string;
  }) {
    // Don't notify if the user triggered it themselves
    if (userId === actorId) return null;

    const notification = await prisma.notification.create({
      data: {
        userId,
        actorId,
        type,
        message,
        link,
      },
      include: {
        actor: { select: { id: true, name: true, username: true, avatarUrl: true } }
      }
    });

    // Emit real-time event to the specific user's room
    io.to(userId).emit('new_notification', notification);

    return notification;
  }

  static async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        actor: { select: { id: true, name: true, username: true, avatarUrl: true } }
      }
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    
    if (!notification || notification.userId !== userId) {
      throw new Error('Beeksisni hin argamne');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}
