import type { Request, Response } from 'express';

export const healthController = {
  getStatus(_req: Request, res: Response) {
    res.json({ status: 'ok', module: 'health' });
  }
};