import { Router } from 'express';
import { wikiController } from './wiki.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

export const wikiRouter = Router();

wikiRouter.get('/', authMiddleware, wikiController.list);
wikiRouter.post('/', authMiddleware, wikiController.create);
wikiRouter.get('/:pageId', authMiddleware, wikiController.detail);