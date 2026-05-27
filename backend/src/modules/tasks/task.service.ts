import { ApiError } from '../../utils/apiError.js';
import { TaskModel } from '../../models/task.model.js';
import { ProjectModel } from '../../models/project.model.js';
import { WorkspaceModel } from '../../models/workspace.model.js';
import { getDatabaseMode, memoryDb, createId } from '../../services/memoryDb.js';
import { getSocketServer } from '../../config/socket.js';
import { socketEvents } from '../../socket/events.js';
import { notificationService } from '../notifications/notification.service.js';
import { activityService } from '../activity/activity.service.js';

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
    const projectDoc: any = project as any;
    return TaskModel.find({ project: projectDoc._id }).sort({ status: 1, order: 1, createdAt: 1 });
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
      try {
        const io = getSocketServer();
        io.to(`project:${projectId}`).emit(socketEvents.taskUpdated, { projectId, taskId: task.id });
        io.to(`workspace:${project.workspace?.toString()}`).emit(socketEvents.activityNew, { workspaceId: project.workspace?.toString() });
        void activityService.create({
          workspace: project.workspace?.toString(),
          project: project.id,
          task: task.id,
          actor: userId,
          type: 'task_created',
          summary: `Created task ${task.title}`
        });
      } catch (err) {
        // socket server unavailable — ignore
      }
      return task;
    }

    const project = await assertProjectAccess(userId, projectId);
    const projectDoc: any = project as any;
    const currentCount = await TaskModel.countDocuments({ project: projectDoc._id, status: payload.status ?? 'todo' });

    const created = await TaskModel.create({
      workspace: projectDoc.workspace,
      project: projectDoc._id,
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

    try {
      // create notifications for assignees
      const assignees = payload.assigneeIds ?? [];
      for (const assigneeId of assignees) {
        await notificationService.create({
          recipient: assigneeId,
          actor: userId,
          type: 'assignment',
          title: 'New task assigned',
          body: `${payload.title}`,
          workspace: projectDoc.workspace?.toString() ?? undefined,
          project: projectDoc._id?.toString() ?? undefined,
          task: (created as any)._id?.toString() ?? undefined
        });
        try {
          const io = getSocketServer();
          io.to(`user:${assigneeId}`).emit(socketEvents.notificationNew, { userId: assigneeId, taskId: (created as any)._id?.toString() });
        } catch (err) {
          // ignore
        }
      }
    } catch (err) {
      // ignore notification failures
    }

    return created;
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
    const taskDoc: any = task as any;

    if (payload.status && payload.status !== task.status) {
      const nextOrder = await TaskModel.countDocuments({ project: taskDoc.project, status: payload.status });
      task.status = payload.status as never;
      task.order = nextOrder;
    }

    if (payload.title !== undefined) task.title = payload.title;
    if (payload.description !== undefined) task.description = payload.description;
    if (payload.priority !== undefined) task.priority = payload.priority as never;
    if (payload.labels !== undefined) task.labels = payload.labels;
    if (payload.dueDate !== undefined) task.dueDate = payload.dueDate ? new Date(payload.dueDate) : undefined;
    if (payload.assigneeIds !== undefined) task.assignees = payload.assigneeIds as never;

    await (task as any).save();

    try {
      const io = getSocketServer();
      const projId = taskDoc.project.toString();
      io.to(`project:${projId}`).emit(socketEvents.taskUpdated, { projectId: projId, taskId: taskDoc._id.toString() });
      io.to(`workspace:${taskDoc.workspace.toString()}`).emit(socketEvents.activityNew, { workspaceId: taskDoc.workspace.toString() });
      void activityService.create({
        workspace: taskDoc.workspace.toString(),
        project: projId,
        task: taskDoc._id.toString(),
        actor: userId,
        type: 'task_updated',
        summary: `Updated task ${task.title}`
      });
    } catch (err) {
      // ignore when socket server not present
    }
    try {
      // notify assignees of update
      const assignees: string[] = (taskDoc.assignees ?? []) as string[];
      for (const assigneeId of assignees) {
        if (assigneeId === userId) continue;
        await notificationService.create({
          recipient: assigneeId,
          actor: userId,
          type: 'task_update',
          title: 'Task updated',
          body: `${task.title}`,
          workspace: taskDoc.workspace?.toString() ?? undefined,
          project: taskDoc.project?.toString() ?? undefined,
          task: taskDoc._id?.toString() ?? undefined
        });
        try {
          const io = getSocketServer();
          io.to(`user:${assigneeId}`).emit(socketEvents.notificationNew, { userId: assigneeId, taskId: taskDoc._id?.toString() });
        } catch (err) {
          // ignore
        }
      }
    } catch (err) {
      // ignore
    }
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
    const taskDoc: any = task as any;
    task.status = payload.status as never;
    task.order = payload.order ?? 0;
    await (task as any).save();

    try {
      const io = getSocketServer();
      const projId = taskDoc.project.toString();
      io.to(`project:${projId}`).emit(socketEvents.taskMoved, { projectId: projId, taskId: taskDoc._id.toString() });
      io.to(`workspace:${taskDoc.workspace.toString()}`).emit(socketEvents.activityNew, { workspaceId: taskDoc.workspace.toString() });
      void activityService.create({
        workspace: taskDoc.workspace.toString(),
        project: projId,
        task: taskDoc._id.toString(),
        actor: userId,
        type: 'task_moved',
        summary: `Moved task ${task.title} to ${task.status}`
      });
    } catch (err) {
      // ignore
    }
    try {
      const assignees: string[] = (taskDoc.assignees ?? []) as string[];
      for (const assigneeId of assignees) {
        if (assigneeId === userId) continue;
        await notificationService.create({
          recipient: assigneeId,
          actor: userId,
          type: 'task_update',
          title: 'Task moved',
          body: `${task.title}`,
          workspace: taskDoc.workspace?.toString() ?? undefined,
          project: taskDoc.project?.toString() ?? undefined,
          task: taskDoc._id?.toString() ?? undefined
        });
        try {
          const io = getSocketServer();
          io.to(`user:${assigneeId}`).emit(socketEvents.notificationNew, { userId: assigneeId, taskId: taskDoc._id?.toString() });
        } catch (err) {
          // ignore
        }
      }
    } catch (err) {
      // ignore
    }
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
    const taskDoc: any = task as any;
    await (task as any).deleteOne();

    try {
      const io = getSocketServer();
      const projId = taskDoc.project.toString();
      io.to(`project:${projId}`).emit(socketEvents.taskUpdated, { projectId: projId, taskId: taskDoc._id.toString() });
      io.to(`workspace:${taskDoc.workspace.toString()}`).emit(socketEvents.activityNew, { workspaceId: taskDoc.workspace.toString() });
      void activityService.create({
        workspace: taskDoc.workspace.toString(),
        project: projId,
        task: taskDoc._id.toString(),
        actor: userId,
        type: 'task_deleted',
        summary: `Deleted task ${task.title}`
      });
    } catch (err) {
      // ignore
    }
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