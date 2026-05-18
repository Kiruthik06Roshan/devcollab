import { Router } from 'express';
import { healthRouter } from './health.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { workspaceRouter } from '../modules/workspaces/workspace.routes';
import { projectRouter } from '../modules/projects/project.routes';
import { taskRouter } from '../modules/tasks/task.routes';
import { snippetRouter } from '../modules/snippets/snippet.routes';
import { wikiRouter } from '../modules/wiki/wiki.routes';
import { activityRouter } from '../modules/activity/activity.routes';
import { notificationRouter } from '../modules/notifications/notification.routes';
import { aiRouter } from '../modules/ai/ai.routes';

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