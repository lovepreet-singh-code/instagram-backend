import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IComment>('Comment', commentSchema);
