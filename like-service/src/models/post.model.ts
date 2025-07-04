import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    caption: { type: String, required: true },
    media: [{ type: String }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
