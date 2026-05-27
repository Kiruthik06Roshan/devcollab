import { ApiError } from '../../utils/apiError.js';
import { ProjectModel } from '../../models/project.model.js';
import { TaskModel } from '../../models/task.model.js';
import { WorkspaceModel } from '../../models/workspace.model.js';
import { getDatabaseMode, memoryDb, createId } from '../../services/memoryDb.js';
import { getSocketServer } from '../../config/socket.js';
import { socketEvents } from '../../socket/events.js';
import { randomSuffix, slugify } from '../../utils/slug.js';
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

async function ensureUniqueProjectSlug(workspaceId: string, baseSlug: string) {
  if (getDatabaseMode() === 'memory') {
    let slug = baseSlug;
    while (memoryDb.projects.some((project) => project.workspace === workspaceId && project.slug === slug)) {
      slug = `${baseSlug}-${randomSuffix(4)}`;
    }
    return slug;
  }

  let slug = baseSlug;
  while (await ProjectModel.exists({ workspace: workspaceId, slug })) {
    slug = `${baseSlug}-${randomSuffix(4)}`;
  }
  return slug;
}

export const projectService = {
  async list(userId: string) {
    if (getDatabaseMode() === 'memory') {
      const workspaceIds = memoryDb.workspaces
        .filter((workspace) => workspace.owner === userId || workspace.members.some((member) => member.user === userId))
        .map((workspace) => workspace.id);
      return memoryDb.projects.filter((project) => workspaceIds.includes(project.workspace));
    }

    const workspaces = await WorkspaceModel.find({ $or: [{ owner: userId }, { 'members.user': userId }] }).select('_id');
    return ProjectModel.find({ workspace: { $in: workspaces.map((workspace) => workspace._id) } }).sort({ updatedAt: -1 });
  },

  async create(userId: string, payload: { workspaceId: string; name: string; description?: string; color?: string }) {
    if (getDatabaseMode() === 'memory') {
      const workspace = memoryDb.workspaces.find(
        (item) => item.id === payload.workspaceId && (item.owner === userId || item.members.some((member) => member.user === userId))
      );

      if (!workspace) {
        throw new ApiError(404, 'Workspace not found');
      }

      const project = {
        id: createId(),
        workspace: workspace.id,
        name: payload.name,
        slug: await ensureUniqueProjectSlug(workspace.id, slugify(payload.name)),
        description: payload.description ?? '',
        status: 'active' as const,
        color: payload.color ?? '#38bdf8',
        owner: userId,
        members: [userId]
      };

      memoryDb.projects.push(project);
      try {
        const io = getSocketServer();
        io.to(`workspace:${workspace.id}`).emit(socketEvents.activityNew, { workspaceId: workspace.id });
        void activityService.create({
          workspace: workspace.id,
          project: project.id,
          actor: userId,
          type: 'project_created',
          summary: `Created project ${project.name}`
        });
      } catch (err) {
        // ignore socket errors
      }
      return project;
    }

    const workspace = await WorkspaceModel.findOne({
      _id: payload.workspaceId,
      $or: [{ owner: userId }, { 'members.user': userId }]
    });

    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    const slug = await ensureUniqueProjectSlug(workspace.id, slugify(payload.name));
    const created = await ProjectModel.create({
      workspace: workspace._id,
      name: payload.name,
      slug,
      description: payload.description ?? '',
      color: payload.color ?? '#38bdf8',
      owner: userId,
      members: [userId]
    });

    try {
      const io = getSocketServer();
      io.to(`workspace:${workspace.id.toString()}`).emit(socketEvents.activityNew, { workspaceId: workspace.id.toString() });
      void activityService.create({
        workspace: workspace.id.toString(),
        project: (created as any)._id?.toString(),
        actor: userId,
        type: 'project_created',
        summary: `Created project ${created.name}`
      });
    } catch (err) {
      // ignore
    }

    return created;
  },

  async detail(userId: string, projectId: string) {
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

    const project = await assertProjectAccess(userId, projectId);
    return project;
  },

  async board(userId: string, projectId: string) {
    if (getDatabaseMode() === 'memory') {
      const project = await this.detail(userId, projectId);
      const tasks = memoryDb.tasks.filter((task) => task.project === project.id).sort((left, right) => left.order - right.order);

      return {
        project,
        tasks,
        columns: {
          todo: tasks.filter((task) => task.status === 'todo'),
          in_progress: tasks.filter((task) => task.status === 'in_progress'),
          in_review: tasks.filter((task) => task.status === 'in_review'),
          done: tasks.filter((task) => task.status === 'done')
        }
      };
    }

    const project = await assertProjectAccess(userId, projectId);
    const projectDoc: any = project as any;
    const tasks = await TaskModel.find({ project: projectDoc._id }).sort({ status: 1, order: 1, createdAt: 1 });

    return {
      project,
      tasks,
      columns: {
        todo: tasks.filter((task) => task.status === 'todo'),
        in_progress: tasks.filter((task) => task.status === 'in_progress'),
        in_review: tasks.filter((task) => task.status === 'in_review'),
        done: tasks.filter((task) => task.status === 'done')
      }
    };
  }
};