import { Schema, model, type InferSchemaType } from 'mongoose';
import { workspaceRoles } from './constants.js';

const workspaceMemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: workspaceRoles, default: 'member' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const workspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [workspaceMemberSchema], default: [] },
    plan: { type: String, default: 'free' },
    settings: {
      type: {
        allowPublicJoin: { type: Boolean, default: false },
        enableAiInsights: { type: Boolean, default: true },
        enableRealTimePresence: { type: Boolean, default: true }
      },
      default: {}
    }
  },
  { timestamps: true, versionKey: false }
);

workspaceSchema.index({ owner: 1, createdAt: -1 });

export type WorkspaceDocument = InferSchemaType<typeof workspaceSchema>;
export const WorkspaceModel = model('Workspace', workspaceSchema);