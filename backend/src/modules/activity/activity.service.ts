import { ActivityLogModel } from '../../models/activityLog.model.js';
import { getDatabaseMode } from '../../services/memoryDb.js';

export const activityService = {
  async list(workspaceId: string) {
    if (getDatabaseMode() === 'memory') {
      return [] as any[];
    }

    return ActivityLogModel.find({ workspace: workspaceId }).sort({ createdAt: -1 }).limit(200).populate('actor', 'name avatarUrl');
  },

  async create(payload: { workspace: string; project?: string | null; task?: string | null; actor: string; type: string; summary: string; metadata?: any }) {
    if (getDatabaseMode() === 'memory') {
      return null;
    }

    return ActivityLogModel.create({
      workspace: payload.workspace,
      project: payload.project ?? undefined,
      task: payload.task ?? undefined,
      actor: payload.actor,
      type: payload.type,
      summary: payload.summary,
      metadata: payload.metadata ?? {}
    });
  }
};
 