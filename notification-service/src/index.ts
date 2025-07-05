import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';

import notificationRoutes from './routes/notification.routes';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/notifications', notificationRoutes);

app.listen(process.env.PORT || 5004, async () => {
  await connectDB();
  console.log(`🚀 Notification-service running on port ${process.env.PORT || 5004}`);
});
