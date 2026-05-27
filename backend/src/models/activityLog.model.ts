import { Schema, model, type InferSchemaType } from 'mongoose';
import { activityTypes } from './constants.js';

const activityLogSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    task: { type: Schema.Types.ObjectId, ref: 'Task', index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: activityTypes, required: true },
    summary: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true, versionKey: false }
);

activityLogSchema.index({ workspace: 1, createdAt: -1 });

export type ActivityLogDocument = InferSchemaType<typeof activityLogSchema>;
export const ActivityLogModel = model('ActivityLog', activityLogSchema);