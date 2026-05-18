import { Schema, model, type InferSchemaType } from 'mongoose';

const commentSchema = new Schema(
  {
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    mentions: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    editedAt: { type: Date }
  },
  { timestamps: true, versionKey: false }
);

export type CommentDocument = InferSchemaType<typeof commentSchema>;
export const CommentModel = model('Comment', commentSchema);