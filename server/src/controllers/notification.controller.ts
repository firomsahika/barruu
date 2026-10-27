import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';

export class NotificationController {
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Hin seenin' });
        return;
      }
      const count = await NotificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Get unread notifications count error');
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Hin seenin' });
        return;
      }
      const notifications = await NotificationService.getNotifications(userId);
      res.json(notifications);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Get notifications error');
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Hin seenin' });
        return;
      }
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
        res.status(400).json({ error: 'Notification ID is required' });
        return;
      }
      const notification = await NotificationService.markAsRead(id, userId);
      res.json(notification);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Mark notification as read error');
      res.status(404).json({ error: error.message || 'Dogoggora serverii' });
    }
  }

  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Hin seenin' });
        return;
      }
      await NotificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Mark all as read error');
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }
}
