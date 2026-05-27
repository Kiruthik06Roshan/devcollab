import { NotificationModel } from '../../models/notification.model.js';
import { getDatabaseMode } from '../../services/memoryDb.js';
import { ApiError } from '../../utils/apiError.js';

export const notificationService = {
  async list(userId: string) {
    if (getDatabaseMode() === 'memory') {
      return [] as any[];
    }

    return NotificationModel.find({ recipient: userId }).sort({ createdAt: -1 }).limit(100);
  },

  async read(userId: string, notificationId: string) {
    if (getDatabaseMode() === 'memory') {
      return null;
    }

    const notification = await NotificationModel.findOne({ _id: notificationId, recipient: userId });
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    notification.readAt = new Date();
    await notification.save();
    return notification;
  },

  async markAll(userId: string) {
    if (getDatabaseMode() === 'memory') {
      return null;
    }

    await NotificationModel.updateMany({ recipient: userId, readAt: { $exists: false } }, { $set: { readAt: new Date() } });
    return true;
  },

  async create(payload: {
    recipient: string;
    actor?: string | null;
    type: string;
    title: string;
    body?: string;
    workspace?: string | null;
    project?: string | null;
    task?: string | null;
  }) {
    if (getDatabaseMode() === 'memory') {
      return null;
    }

    return NotificationModel.create({
      recipient: payload.recipient,
      actor: payload.actor,
      type: payload.type,
      title: payload.title,
      body: payload.body ?? '',
      workspace: payload.workspace,
      project: payload.project,
      task: payload.task
    });
  }
};
 