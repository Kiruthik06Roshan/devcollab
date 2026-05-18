import { Schema, model, type InferSchemaType } from 'mongoose';

const snippetSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    language: { type: String, default: 'typescript' },
    code: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

snippetSchema.index({ project: 1, createdAt: -1 });

export type SnippetDocument = InferSchemaType<typeof snippetSchema>;
export const SnippetModel = model('Snippet', snippetSchema);