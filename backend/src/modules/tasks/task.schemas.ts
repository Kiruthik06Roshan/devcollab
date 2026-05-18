import { z } from 'zod';

export const taskCreateSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(5000).optional().default(''),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  labels: z.array(z.string().min(1).max(32)).optional().default([]),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeIds: z.array(z.string().min(1)).optional().default([])
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const taskMoveSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'in_review', 'done']),
  order: z.number().int().nonnegative().optional()
});