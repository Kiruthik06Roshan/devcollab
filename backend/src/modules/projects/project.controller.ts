import type { Request, Response } from 'express';
import { projectService } from './project.service.js';

export const projectController = {
  async list(req: Request, res: Response) {
    const projects = await projectService.list(req.user!.id);
    return res.json({ projects });
  },
  async create(req: Request, res: Response) {
    const project = await projectService.create(req.user!.id, req.body);
    return res.status(201).json({ project });
  },
  async detail(req: Request, res: Response) {
    const projectId = req.params.projectId as string;
    const project = await projectService.detail(req.user!.id, projectId);
    return res.json({ project });
  },
  async board(req: Request, res: Response) {
    const projectId = req.params.projectId as string;
    const board = await projectService.board(req.user!.id, projectId);
    return res.json(board);
  },
  async listView(req: Request, res: Response) {
    return projectController.board(req, res);
  },
  async calendar(_req: Request, res: Response) {
    return res.json({ message: 'Calendar route ready for future iteration' });
  },
  async wiki(_req: Request, res: Response) {
    return res.json({ message: 'Wiki route ready for future iteration' });
  },
  async snippets(_req: Request, res: Response) {
    return res.json({ message: 'Snippets route ready for future iteration' });
  },
  async activity(_req: Request, res: Response) {
    return res.json({ message: 'Activity route ready for future iteration' });
  }
};