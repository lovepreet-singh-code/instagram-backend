import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', protect, getNotifications);
router.patch('/read', protect, markAsRead);

export default router;
