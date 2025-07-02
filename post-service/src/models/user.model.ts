import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  profilePicture?: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  profilePicture: { type: String },
});

export default mongoose.model<IUser>('User', userSchema);
