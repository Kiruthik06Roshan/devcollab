import { ApiError } from '../../utils/apiError.js';
import { WorkspaceModel } from '../../models/workspace.model.js';
import { ProjectModel } from '../../models/project.model.js';
import { UserModel } from '../../models/user.model.js';
import { getDatabaseMode, memoryDb, createId } from '../../services/memoryDb.js';
import { getSocketServer } from '../../config/socket.js';
import { socketEvents } from '../../socket/events.js';
import { slugify, randomSuffix } from '../../utils/slug.js';
import { activityService } from '../activity/activity.service.js';

function membershipQuery(userId: string) {
  return { $or: [{ owner: userId }, { 'members.user': userId }] };
}

async function ensureUniqueWorkspaceSlug(baseSlug: string) {
  if (getDatabaseMode() === 'memory') {
    let slug = baseSlug;
    while (memoryDb.workspaces.some((workspace) => workspace.slug === slug)) {
      slug = `${baseSlug}-${randomSuffix(4)}`;
    }
    return slug;
  }

  let slug = baseSlug;
  while (await WorkspaceModel.exists({ slug })) {
    slug = `${baseSlug}-${randomSuffix(4)}`;
  }
  return slug;
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

export const workspaceService = {
  async list(userId: string) {
    if (getDatabaseMode() === 'memory') {
      return memoryDb.workspaces.filter(
        (workspace) => workspace.owner === userId || workspace.members.some((member) => member.user === userId)
      );
    }

    return WorkspaceModel.find(membershipQuery(userId)).sort({ updatedAt: -1 });
  },

  async create(userId: string, payload: { name: string; description?: string }) {
    if (getDatabaseMode() === 'memory') {
      const workspace = {
        id: createId(),
        name: payload.name,
        slug: await ensureUniqueWorkspaceSlug(slugify(payload.name)),
        description: payload.description ?? '',
        logoUrl: '',
        owner: userId,
        members: [{ user: userId, role: 'owner', joinedAt: new Date() }],
        plan: 'free'
      };

      memoryDb.workspaces.push(workspace);
      const user = memoryDb.users.find((item) => item.id === userId);
      if (user) {
        user.workspaceMemberships.push({ workspace: workspace.id, role: 'owner', joinedAt: new Date() });
      }

      try {
        const io = getSocketServer();
        io.to(`workspace:${workspace.id}`).emit(socketEvents.activityNew, { workspaceId: workspace.id });
        void activityService.create({
          workspace: workspace.id,
          actor: userId,
          type: 'workspace_created',
          summary: `Created workspace ${workspace.name}`
        });
      } catch (err) {
        // ignore
      }

      return workspace;
    }

    const slug = await ensureUniqueWorkspaceSlug(slugify(payload.name));
    const workspace = await WorkspaceModel.create({
      name: payload.name,
      slug,
      description: payload.description ?? '',
      owner: userId,
      members: [{ user: userId, role: 'owner', joinedAt: new Date() }]
    });

    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: {
        workspaceMemberships: {
          workspace: workspace._id,
          role: 'owner',
          joinedAt: new Date()
        }
      }
    });

    try {
      const io = getSocketServer();
      io.to(`workspace:${workspace._id.toString()}`).emit(socketEvents.activityNew, { workspaceId: workspace._id.toString() });
      void activityService.create({
        workspace: workspace._id.toString(),
        actor: userId,
        type: 'workspace_created',
        summary: `Created workspace ${workspace.name}`
      });
    } catch (err) {
      // ignore
    }

    return workspace;
  },

  async detail(userId: string, workspaceId: string) {
    if (getDatabaseMode() === 'memory') {
      const workspace = memoryDb.workspaces.find(
        (item) => item.id === workspaceId && (item.owner === userId || item.members.some((member) => member.user === userId))
      );

      if (!workspace) {
        throw new ApiError(404, 'Workspace not found');
      }

      return workspace;
    }

    const workspace = await WorkspaceModel.findOne({ _id: workspaceId, ...membershipQuery(userId) });
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }
    return workspace;
  },

  async projects(userId: string, workspaceId: string) {
    if (getDatabaseMode() === 'memory') {
      await this.detail(userId, workspaceId);
      return memoryDb.projects.filter((project) => project.workspace === workspaceId);
    }

    await this.detail(userId, workspaceId);
    return ProjectModel.find({ workspace: workspaceId }).sort({ updatedAt: -1 });
  },

  async createProject(userId: string, workspaceId: string, payload: { name: string; description?: string; color?: string }) {
    if (getDatabaseMode() === 'memory') {
      const workspace = await this.detail(userId, workspaceId);
      const project = {
        id: createId(),
        workspace: workspace.id,
        name: payload.name,
        slug: await ensureUniqueProjectSlug(workspaceId, slugify(payload.name)),
        description: payload.description ?? '',
        status: 'active' as const,
        color: payload.color ?? '#38bdf8',
        owner: userId,
        members: [userId]
      };

      memoryDb.projects.push(project);
      return project;
    }

    const workspace = await this.detail(userId, workspaceId);
    const slug = await ensureUniqueProjectSlug(workspaceId, slugify(payload.name));
    return ProjectModel.create({
      workspace: (workspace as any)._id,
      name: payload.name,
      slug,
      description: payload.description ?? '',
      color: payload.color ?? '#38bdf8',
      owner: userId,
      members: [userId]
    });
  }
};