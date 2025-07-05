import { Response } from 'express';
import Comment from '../models/comment.model';
import { AuthRequest } from '../types/express';

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { postId } = req.params;
  const { text } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized: userId missing' });
    return;
  }

  try {
    const comment = await Comment.create({ post: postId, user: userId, text });

    
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const getCommentsByPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const { postId } = req.params;
  try {
    const comments = await Comment.find({ post: postId }).populate('user', 'username profilePicture');
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const userId = req.userId;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.user.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};
