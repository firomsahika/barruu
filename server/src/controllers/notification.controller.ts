import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const notifications = await NotificationService.getNotifications(userId);
      res.json(notifications);
    } catch (error: any) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
        res.status(400).json({ error: 'Notification ID is required' });
        return;
      }
      const notification = await NotificationService.markAsRead(id, userId);
      res.json(notification);
    } catch (error: any) {
      console.error('Mark notification as read error:', error);
      res.status(404).json({ error: error.message || 'Dogoggora serverii' });
    }
  }

  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      await NotificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }
}
