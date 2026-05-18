import { ApiError } from '../../utils/apiError';
import { TaskModel } from '../../models/task.model';
import { ProjectModel } from '../../models/project.model';
import { WorkspaceModel } from '../../models/workspace.model';
import { getDatabaseMode, memoryDb, createId } from '../../services/memoryDb';

async function assertProjectAccess(userId: string, projectId: string) {
  if (getDatabaseMode() === 'memory') {
    const project = memoryDb.projects.find((item) => item.id === projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    const workspace = memoryDb.workspaces.find(
      (item) => item.id === project.workspace && (item.owner === userId || item.members.some((member) => member.user === userId))
    );

    if (!workspace) {
      throw new ApiError(403, 'Forbidden');
    }

    return project;
  }

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const workspace = await WorkspaceModel.findOne({
    _id: project.workspace,
    $or: [{ owner: userId }, { 'members.user': userId }]
  });

  if (!workspace) {
    throw new ApiError(403, 'Forbidden');
  }

  return project;
}

async function assertTaskAccess(userId: string, taskId: string) {
  if (getDatabaseMode() === 'memory') {
    const task = memoryDb.tasks.find((item) => item.id === taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    await assertProjectAccess(userId, task.project);
    return task;
  }

  const task = await TaskModel.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  await assertProjectAccess(userId, task.project.toString());
  return task;
}

export const taskService = {
  async list(userId: string, projectId: string) {
    if (getDatabaseMode() === 'memory') {
      const project = await assertProjectAccess(userId, projectId);
      return memoryDb.tasks.filter((task) => task.project === project.id).sort((left, right) => left.order - right.order);
    }

    const project = await assertProjectAccess(userId, projectId);
    return TaskModel.find({ project: project._id }).sort({ status: 1, order: 1, createdAt: 1 });
  },

  async create(userId: string, projectId: string, payload: { title: string; description?: string; status?: string; priority?: string; labels?: string[]; dueDate?: string | null; assigneeIds?: string[] }) {
    if (getDatabaseMode() === 'memory') {
      const project = await assertProjectAccess(userId, projectId);
      const currentCount = memoryDb.tasks.filter((task) => task.project === project.id && task.status === (payload.status ?? 'todo')).length;

      const task = {
        id: createId(),
        workspace: project.workspace.toString(),
        project: project.id,
        title: payload.title,
        description: payload.description ?? '',
        status: (payload.status ?? 'todo') as 'todo' | 'in_progress' | 'in_review' | 'done',
        priority: (payload.priority ?? 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        order: currentCount,
        labels: payload.labels ?? [],
        assignees: payload.assigneeIds ?? [],
        reporter: userId,
        dueDate: payload.dueDate ?? null
      };

      memoryDb.tasks.push(task);
      return task;
    }

    const project = await assertProjectAccess(userId, projectId);
    const currentCount = await TaskModel.countDocuments({ project: project._id, status: payload.status ?? 'todo' });

    return TaskModel.create({
      workspace: project.workspace,
      project: project._id,
      title: payload.title,
      description: payload.description ?? '',
      status: payload.status ?? 'todo',
      priority: payload.priority ?? 'medium',
      labels: payload.labels ?? [],
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      assignees: payload.assigneeIds ?? [],
      reporter: userId,
      order: currentCount
    });
  },

  async update(userId: string, taskId: string, payload: { title?: string; description?: string; status?: string; priority?: string; labels?: string[]; dueDate?: string | null; assigneeIds?: string[] }) {
    if (getDatabaseMode() === 'memory') {
      const task = await assertTaskAccess(userId, taskId);
      const target = memoryDb.tasks.find((item) => item.id === task.id);
      if (!target) {
        throw new ApiError(404, 'Task not found');
      }

      if (payload.status && payload.status !== target.status) {
        target.status = payload.status as never;
        target.order = memoryDb.tasks.filter((item) => item.project === target.project && item.status === target.status).length;
      }

      if (payload.title !== undefined) target.title = payload.title;
      if (payload.description !== undefined) target.description = payload.description;
      if (payload.priority !== undefined) target.priority = payload.priority as never;
      if (payload.labels !== undefined) target.labels = payload.labels;
      if (payload.dueDate !== undefined) target.dueDate = payload.dueDate;
      if (payload.assigneeIds !== undefined) target.assignees = payload.assigneeIds;

      return target;
    }

    const task = await assertTaskAccess(userId, taskId);

    if (payload.status && payload.status !== task.status) {
      const nextOrder = await TaskModel.countDocuments({ project: task.project, status: payload.status });
      task.status = payload.status as never;
      task.order = nextOrder;
    }

    if (payload.title !== undefined) task.title = payload.title;
    if (payload.description !== undefined) task.description = payload.description;
    if (payload.priority !== undefined) task.priority = payload.priority as never;
    if (payload.labels !== undefined) task.labels = payload.labels;
    if (payload.dueDate !== undefined) task.dueDate = payload.dueDate ? new Date(payload.dueDate) : undefined;
    if (payload.assigneeIds !== undefined) task.assignees = payload.assigneeIds as never;

    await task.save();
    return task;
  },

  async move(userId: string, taskId: string, payload: { status: string; order?: number }) {
    if (getDatabaseMode() === 'memory') {
      const task = await assertTaskAccess(userId, taskId);
      const target = memoryDb.tasks.find((item) => item.id === task.id);
      if (!target) {
        throw new ApiError(404, 'Task not found');
      }

      target.status = payload.status as never;
      target.order = payload.order ?? 0;
      return target;
    }

    const task = await assertTaskAccess(userId, taskId);
    task.status = payload.status as never;
    task.order = payload.order ?? 0;
    await task.save();
    return task;
  },

  async remove(userId: string, taskId: string) {
    if (getDatabaseMode() === 'memory') {
      const task = await assertTaskAccess(userId, taskId);
      const index = memoryDb.tasks.findIndex((item) => item.id === task.id);
      if (index >= 0) {
        memoryDb.tasks.splice(index, 1);
      }
      return task;
    }

    const task = await assertTaskAccess(userId, taskId);
    await task.deleteOne();
    return task;
  },

  async detail(userId: string, taskId: string) {
    if (getDatabaseMode() === 'memory') {
      const task = memoryDb.tasks.find((item) => item.id === taskId);
      if (!task) {
        throw new ApiError(404, 'Task not found');
      }

      const project = memoryDb.projects.find((item) => item.id === task.project);
      if (!project) {
        throw new ApiError(404, 'Project not found');
      }

      const workspace = memoryDb.workspaces.find(
        (item) => item.id === project.workspace && (item.owner === userId || item.members.some((member) => member.user === userId))
      );

      if (!workspace) {
        throw new ApiError(403, 'Forbidden');
      }

      return task;
    }

    return assertTaskAccess(userId, taskId);
  }
};