import type { Request, Response } from 'express';

export const notificationController = {
  list(_req: Request, res: Response) {
    res.json({ message: 'Notification list placeholder' });
  },
  read(_req: Request, res: Response) {
    res.json({ message: 'Notification read placeholder' });
  }
};