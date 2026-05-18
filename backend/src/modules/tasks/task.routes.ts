import { Router } from 'express';
import { taskController } from './task.controller';
import { authMiddleware } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { taskCreateSchema, taskMoveSchema, taskUpdateSchema } from './task.schemas';

export const taskRouter = Router();

taskRouter.get('/', authMiddleware, asyncHandler(taskController.list));
taskRouter.post('/', authMiddleware, validateBody(taskCreateSchema), asyncHandler(taskController.create));
taskRouter.get('/:taskId', authMiddleware, asyncHandler(taskController.detail));
taskRouter.patch('/:taskId', authMiddleware, validateBody(taskUpdateSchema), asyncHandler(taskController.update));
taskRouter.delete('/:taskId', authMiddleware, asyncHandler(taskController.remove));
taskRouter.patch('/:taskId/move', authMiddleware, validateBody(taskMoveSchema), asyncHandler(taskController.move));