import { Router } from 'express';
import { workspaceController } from './workspace.controller';
import { authMiddleware } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { workspaceProjectSchema, workspaceSchema } from './workspace.schemas';

export const workspaceRouter = Router();

workspaceRouter.get('/', authMiddleware, asyncHandler(workspaceController.list));
workspaceRouter.post('/', authMiddleware, validateBody(workspaceSchema), asyncHandler(workspaceController.create));
workspaceRouter.get('/:workspaceId', authMiddleware, asyncHandler(workspaceController.detail));
workspaceRouter.get('/:workspaceId/projects', authMiddleware, asyncHandler(workspaceController.projects));
workspaceRouter.post('/:workspaceId/projects', authMiddleware, validateBody(workspaceProjectSchema), asyncHandler(workspaceController.createProject));