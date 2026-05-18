import { z } from 'zod';

export const projectSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(2).max(80),
  description: z.string().max(240).optional().default(''),
  color: z.string().max(32).optional().default('#38bdf8')
});

export const projectTaskSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(5000).optional().default(''),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  labels: z.array(z.string().min(1).max(32)).optional().default([]),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeIds: z.array(z.string().min(1)).optional().default([])
});