import { Router } from 'express';
import { aiController } from './ai.controller';
import { authMiddleware } from '../../middleware/auth';

export const aiRouter = Router();

aiRouter.post('/task-breakdown', authMiddleware, aiController.taskBreakdown);
aiRouter.post('/sprint-summary', authMiddleware, aiController.sprintSummary);
aiRouter.post('/blocker-detection', authMiddleware, aiController.blockerDetection);
aiRouter.post('/standup-report', authMiddleware, aiController.standupReport);
aiRouter.post('/code-review', authMiddleware, aiController.codeReview);