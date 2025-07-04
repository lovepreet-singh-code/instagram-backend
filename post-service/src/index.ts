import express from 'express';
import { connectDB } from './config/db';
import postRoutes from './routes/post.routes';
import './models/user.model';
import './config/redis';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5001;


app.use(express.json());
app.use('/api/posts', postRoutes);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Post service running on port ${PORT}`);
});
