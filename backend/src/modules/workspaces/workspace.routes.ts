import { Router } from 'express';
import { workspaceController } from './workspace.controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { workspaceProjectSchema, workspaceSchema } from './workspace.schemas.js';

export const workspaceRouter = Router();

workspaceRouter.get('/', authMiddleware, asyncHandler(workspaceController.list));
workspaceRouter.post('/', authMiddleware, validateBody(workspaceSchema), asyncHandler(workspaceController.create));
workspaceRouter.get('/:workspaceId', authMiddleware, asyncHandler(workspaceController.detail));
workspaceRouter.get('/:workspaceId/projects', authMiddleware, asyncHandler(workspaceController.projects));
workspaceRouter.post('/:workspaceId/projects', authMiddleware, validateBody(workspaceProjectSchema), asyncHandler(workspaceController.createProject));