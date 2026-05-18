import { Router } from 'express';
import { wikiController } from './wiki.controller';
import { authMiddleware } from '../../middleware/auth';

export const wikiRouter = Router();

wikiRouter.get('/', authMiddleware, wikiController.list);
wikiRouter.post('/', authMiddleware, wikiController.create);
wikiRouter.get('/:pageId', authMiddleware, wikiController.detail);