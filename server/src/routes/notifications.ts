import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/unread-count', NotificationController.getUnreadCount);
router.get('/', NotificationController.getNotifications);
router.patch('/mark-all-read', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
