import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './routes/user.routes';
import './config/redis';
import { notFound, errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Middlewares (AFTER routes)
app.use(notFound);
app.use(errorHandler);
