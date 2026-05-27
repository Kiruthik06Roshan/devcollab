import type { Request, Response } from 'express';
import { taskService } from './task.service.js';

export const taskController = {
  async list(req: Request, res: Response) {
    const projectId = (req.params.projectId ?? req.query.projectId) as string;
    const tasks = await taskService.list(req.user!.id, projectId);
    return res.json({ tasks });
  },
  async create(req: Request, res: Response) {
    const projectId = req.params.projectId as string;
    const task = await taskService.create(req.user!.id, projectId, req.body);
    return res.status(201).json({ task });
  },
  async detail(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const task = await taskService.detail(req.user!.id, taskId);
    return res.json({ task });
  },
  async update(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const task = await taskService.update(req.user!.id, taskId, req.body);
    return res.json({ task });
  },
  async move(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const task = await taskService.move(req.user!.id, taskId, req.body);
    return res.json({ task });
  },
  async remove(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    await taskService.remove(req.user!.id, taskId);
    return res.status(204).send();
  }
};