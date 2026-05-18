import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: string;
  };
};

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const cookieToken = req.cookies?.[env.jwtCookieName] as string | undefined;
  const bearerToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const token = cookieToken ?? bearerToken;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub?: string; role?: string };

    req.user = {
      id: payload.sub ?? '',
      role: payload.role ?? 'member'
    };

    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}