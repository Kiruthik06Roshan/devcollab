import { z } from 'zod';

export const workspaceSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(240).optional().default('')
});

export const workspaceProjectSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(240).optional().default(''),
  color: z.string().max(32).optional().default('#38bdf8')
});