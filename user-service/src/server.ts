import dotenv from 'dotenv';
import { app } from './app';
import { connectDB } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI!;

export const startServer = async () => {
  try {
    await connectDB(MONGO_URI);

    app.listen(PORT, () => {
      console.log(`🚀 User-service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};
