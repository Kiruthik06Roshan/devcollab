import type { Request, Response } from 'express';

export const snippetController = {
  list(_req: Request, res: Response) {
    res.json({ message: 'Snippet list placeholder' });
  },
  create(_req: Request, res: Response) {
    res.json({ message: 'Snippet create placeholder' });
  },
  detail(_req: Request, res: Response) {
    res.json({ message: 'Snippet detail placeholder' });
  }
};