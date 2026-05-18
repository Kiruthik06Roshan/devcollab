export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  workspaces: WorkspaceSummary[];
};

export type Workspace = {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  owner: string;
  plan?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Project = {
  _id: string;
  id: string;
  workspace: string;
  name: string;
  slug: string;
  description?: string;
  status?: 'planned' | 'active' | 'paused' | 'archived';
  color?: string;
  owner: string;
  members: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Task = {
  _id: string;
  id: string;
  project: string;
  workspace: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  labels: string[];
  assignees: string[];
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BoardResponse = {
  project: Project;
  tasks: Task[];
  columns: Record<TaskStatus, Task[]>;
};