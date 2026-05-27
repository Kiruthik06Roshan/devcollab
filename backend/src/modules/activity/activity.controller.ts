import type { Request, Response } from 'express';
import { activityService } from './activity.service.js';

export const activityController = {
  async list(req: Request, res: Response) {
    const workspaceId = (req.query.workspaceId as string) ?? undefined;
    if (!workspaceId) return res.status(400).json({ message: 'workspaceId is required' });

    const items = await activityService.list(workspaceId);
    return res.json({ activities: items });
  }
};