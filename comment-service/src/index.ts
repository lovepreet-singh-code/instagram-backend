import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import commentRoutes from './routes/comment.routes';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/comments', commentRoutes);

const PORT = process.env.PORT || 5003;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Comment-Service running on port ${PORT}`);
});
