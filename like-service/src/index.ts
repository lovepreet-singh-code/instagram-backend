import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db';
import likeRoutes from './routes/like.routes';
import './models/like.model';
import './models/user.model';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/likes', likeRoutes);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Like-service running on port ${PORT}`);
});
