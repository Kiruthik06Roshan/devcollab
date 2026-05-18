import { Schema, model, type InferSchemaType } from 'mongoose';

const wikiPageSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    parentPage: { type: Schema.Types.ObjectId, ref: 'WikiPage' },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true, versionKey: false }
);

wikiPageSchema.index({ project: 1, slug: 1 }, { unique: true });

export type WikiPageDocument = InferSchemaType<typeof wikiPageSchema>;
export const WikiPageModel = model('WikiPage', wikiPageSchema);