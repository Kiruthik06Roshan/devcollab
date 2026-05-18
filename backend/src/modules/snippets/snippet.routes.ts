import { Router } from 'express';
import { snippetController } from './snippet.controller';
import { authMiddleware } from '../../middleware/auth';

export const snippetRouter = Router();

snippetRouter.get('/', authMiddleware, snippetController.list);
snippetRouter.post('/', authMiddleware, snippetController.create);
snippetRouter.get('/:snippetId', authMiddleware, snippetController.detail);