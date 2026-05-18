import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { loginSchema, signupSchema } from './auth.schemas';

export const authRouter = Router();

authRouter.post('/signup', validateBody(signupSchema), asyncHandler(authController.signup));
authRouter.post('/login', validateBody(loginSchema), asyncHandler(authController.login));
authRouter.post('/logout', asyncHandler(authController.logout));
authRouter.get('/me', authMiddleware, asyncHandler(authController.me));