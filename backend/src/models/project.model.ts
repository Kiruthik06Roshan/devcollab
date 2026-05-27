import { Schema, model, type InferSchemaType } from 'mongoose';
import { projectStatuses } from './constants.js';

const projectSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: projectStatuses, default: 'active' },
    color: { type: String, default: '#38bdf8' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    archivedAt: { type: Date }
  },
  { timestamps: true, versionKey: false }
);

projectSchema.index({ workspace: 1, slug: 1 }, { unique: true });

export type ProjectDocument = InferSchemaType<typeof projectSchema>;
export const ProjectModel = model('Project', projectSchema);