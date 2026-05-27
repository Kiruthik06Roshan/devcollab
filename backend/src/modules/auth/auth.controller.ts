import type { Request, Response } from 'express';
import { authService } from './auth.service.js';

export const authController = {
  async signup(req: Request, res: Response) {
    const result = await authService.signup(req.body, res);
    return res.status(201).json(result);
  },
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body, res);
    return res.json(result);
  },
  async logout(_req: Request, res: Response) {
    authService.clearSession(res);
    return res.json({ message: 'Logged out' });
  },
  async me(req: Request, res: Response) {
    const user = await authService.getCurrentUser(req.user?.id);
    return res.json({ user });
  }
};