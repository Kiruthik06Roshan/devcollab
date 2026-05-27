import { Schema, model, type InferSchemaType } from 'mongoose';
import { workspaceRoles } from './constants.js';

const workspaceMembershipSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    role: { type: String, enum: workspaceRoles, default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
    workspaceMemberships: { type: [workspaceMembershipSchema], default: [] },
    lastActiveAt: { type: Date }
  },
  { timestamps: true, versionKey: false }
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);