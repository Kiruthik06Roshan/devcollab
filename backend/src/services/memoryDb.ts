import { randomUUID } from 'node:crypto';

export type DatabaseMode = 'mongo' | 'memory';

export type MemoryUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string;
  role: string;
  workspaceMemberships: Array<{ workspace: string; role: string; joinedAt: Date }>;
};

export type MemoryWorkspace = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  owner: string;
  members: Array<{ user: string; role: string; joinedAt: Date }>;
  plan: string;
};

export type MemoryProject = {
  id: string;
  workspace: string;
  name: string;
  slug: string;
  description: string;
  status: 'planned' | 'active' | 'paused' | 'archived';
  color: string;
  owner: string;
  members: string[];
};

export type MemoryTask = {
  id: string;
  workspace: string;
  project: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  order: number;
  labels: string[];
  assignees: string[];
  reporter: string;
  dueDate?: string | null;
};

export const memoryDb = {
  users: [] as MemoryUser[],
  workspaces: [] as MemoryWorkspace[],
  projects: [] as MemoryProject[],
  tasks: [] as MemoryTask[]
};

let databaseMode: DatabaseMode = 'mongo';

export function setDatabaseMode(mode: DatabaseMode) {
  databaseMode = mode;
}

export function getDatabaseMode() {
  return databaseMode;
}

export function createId() {
  return randomUUID();
}