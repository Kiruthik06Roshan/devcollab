import type { Request, Response } from 'express';
import { notificationService } from './notification.service.js';

export const notificationController = {
  async list(req: Request, res: Response) {
    const userId = req.user!.id;
    const items = await notificationService.list(userId);
    return res.json({ notifications: items });
  },
  async read(req: Request, res: Response) {
    const userId = req.user!.id;
    const notificationId = req.params.notificationId as string;
    const item = await notificationService.read(userId, notificationId);
    return res.json({ notification: item });
  }
  ,
  async markAll(req: Request, res: Response) {
    const userId = req.user!.id;
    await notificationService.markAll(userId);
    return res.json({ ok: true });
  }
};