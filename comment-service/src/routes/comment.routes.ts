import express from 'express';
import { addComment, getCommentsByPost, deleteComment } from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/:postId', authMiddleware, addComment);
router.get('/:postId', getCommentsByPost);
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;
