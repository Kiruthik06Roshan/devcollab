import type { Request, Response } from 'express';

export const wikiController = {
  list(_req: Request, res: Response) {
    res.json({ message: 'Wiki list placeholder' });
  },
  create(_req: Request, res: Response) {
    res.json({ message: 'Wiki page create placeholder' });
  },
  detail(_req: Request, res: Response) {
    res.json({ message: 'Wiki page detail placeholder' });
  }
};