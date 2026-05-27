import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

export const notificationRouter = Router();

notificationRouter.get('/', authMiddleware, notificationController.list);
notificationRouter.patch('/:notificationId/read', authMiddleware, notificationController.read);
notificationRouter.patch('/mark-all', authMiddleware, notificationController.markAll);