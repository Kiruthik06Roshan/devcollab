import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { workspaceRouter } from '../modules/workspaces/workspace.routes.js';
import { projectRouter } from '../modules/projects/project.routes.js';
import { taskRouter } from '../modules/tasks/task.routes.js';
import { snippetRouter } from '../modules/snippets/snippet.routes.js';
import { wikiRouter } from '../modules/wiki/wiki.routes.js';
import { activityRouter } from '../modules/activity/activity.routes.js';
import { notificationRouter } from '../modules/notifications/notification.routes.js';
import { aiRouter } from '../modules/ai/ai.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/workspaces', workspaceRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/snippets', snippetRouter);
apiRouter.use('/wiki', wikiRouter);
apiRouter.use('/activity', activityRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/ai', aiRouter);