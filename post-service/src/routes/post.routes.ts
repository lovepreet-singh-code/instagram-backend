// src/routes/post.routes.ts
import express from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
} from '../controllers/post.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', authenticate, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById); // ✅ Correct route

export default router;
