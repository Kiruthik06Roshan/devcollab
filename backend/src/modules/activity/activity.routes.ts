import { Router } from 'express';
import { activityController } from './activity.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

export const activityRouter = Router();

activityRouter.get('/', authMiddleware, activityController.list);