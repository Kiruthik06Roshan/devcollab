import { Schema, model, type InferSchemaType } from 'mongoose';
import { notificationTypes } from './constants.js';

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: notificationTypes, required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    task: { type: Schema.Types.ObjectId, ref: 'Task' },
    readAt: { type: Date }
  },
  { timestamps: true, versionKey: false }
);

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;
export const NotificationModel = model('Notification', notificationSchema);