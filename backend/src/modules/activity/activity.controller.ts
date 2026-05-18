import type { Request, Response } from 'express';

export const activityController = {
  list(_req: Request, res: Response) {
    res.json({ message: 'Activity feed placeholder' });
  }
};