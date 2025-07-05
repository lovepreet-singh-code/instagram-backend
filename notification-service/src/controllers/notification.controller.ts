import { Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import Notification from '../models/notification.model';
import { AuthRequest } from '../types/express';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const notifications = await Notification.find({ recipient: req.userId })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  res.status(200).json({ notifications });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await Notification.updateMany({ recipient: req.userId, isRead: false }, { isRead: true });
  res.status(200).json({ message: 'Marked all as read' });
});
