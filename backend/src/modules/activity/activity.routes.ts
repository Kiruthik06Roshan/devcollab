import { Router } from 'express';
import { activityController } from './activity.controller';
import { authMiddleware } from '../../middleware/auth';

export const activityRouter = Router();

activityRouter.get('/', authMiddleware, activityController.list);