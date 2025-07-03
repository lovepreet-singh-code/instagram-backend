
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  profilePic: String,
}, { timestamps: true });

export default mongoose.model('User', userSchema);
