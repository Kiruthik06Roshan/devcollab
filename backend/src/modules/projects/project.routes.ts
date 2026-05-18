import { Router } from 'express';
import { projectController } from './project.controller';
import { authMiddleware } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { projectSchema } from './project.schemas';
import { taskController } from '../tasks/task.controller';
import { taskCreateSchema } from '../tasks/task.schemas';

export const projectRouter = Router();

projectRouter.get('/', authMiddleware, asyncHandler(projectController.list));
projectRouter.post('/', authMiddleware, validateBody(projectSchema), asyncHandler(projectController.create));
projectRouter.get('/:projectId', authMiddleware, asyncHandler(projectController.detail));
projectRouter.get('/:projectId/board', authMiddleware, asyncHandler(projectController.board));
projectRouter.get('/:projectId/list', authMiddleware, asyncHandler(projectController.listView));
projectRouter.get('/:projectId/calendar', authMiddleware, asyncHandler(projectController.calendar));
projectRouter.get('/:projectId/wiki', authMiddleware, asyncHandler(projectController.wiki));
projectRouter.get('/:projectId/snippets', authMiddleware, asyncHandler(projectController.snippets));
projectRouter.get('/:projectId/activity', authMiddleware, asyncHandler(projectController.activity));
projectRouter.get('/:projectId/tasks', authMiddleware, asyncHandler(taskController.list));
projectRouter.post('/:projectId/tasks', authMiddleware, validateBody(taskCreateSchema), asyncHandler(taskController.create));