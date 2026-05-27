import type { Request, Response } from 'express';
import { workspaceService } from './workspace.service.js';

export const workspaceController = {
  async list(req: Request, res: Response) {
    const workspaces = await workspaceService.list(req.user!.id);
    return res.json({ workspaces });
  },
  async create(req: Request, res: Response) {
    const workspace = await workspaceService.create(req.user!.id, req.body);
    return res.status(201).json({ workspace });
  },
  async detail(req: Request, res: Response) {
    const workspaceId = req.params.workspaceId as string;
    const workspace = await workspaceService.detail(req.user!.id, workspaceId);
    return res.json({ workspace });
  },
  async projects(req: Request, res: Response) {
    const workspaceId = req.params.workspaceId as string;
    const projects = await workspaceService.projects(req.user!.id, workspaceId);
    return res.json({ projects });
  },
  async createProject(req: Request, res: Response) {
    const workspaceId = req.params.workspaceId as string;
    const project = await workspaceService.createProject(req.user!.id, workspaceId, req.body);
    return res.status(201).json({ project });
  }
};