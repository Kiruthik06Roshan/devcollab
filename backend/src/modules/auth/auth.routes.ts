import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { loginSchema, signupSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/signup', validateBody(signupSchema), asyncHandler(authController.signup));
authRouter.post('/login', validateBody(loginSchema), asyncHandler(authController.login));
authRouter.post('/logout', asyncHandler(authController.logout));
authRouter.get('/me', authMiddleware, asyncHandler(authController.me));