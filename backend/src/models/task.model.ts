import { Schema, model, type InferSchemaType } from 'mongoose';
import { taskPriorities, taskStatuses } from './constants.js';

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 }
  },
  { _id: false }
);

const taskSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: taskStatuses, default: 'todo', index: true },
    priority: { type: String, enum: taskPriorities, default: 'medium', index: true },
    order: { type: Number, default: 0 },
    labels: { type: [String], default: [] },
    assignees: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attachments: { type: [attachmentSchema], default: [] },
    dueDate: { type: Date },
    completedAt: { type: Date }
  },
  { timestamps: true, versionKey: false }
);

taskSchema.index({ project: 1, status: 1, order: 1 });

export type TaskDocument = InferSchemaType<typeof taskSchema>;
export const TaskModel = model('Task', taskSchema);