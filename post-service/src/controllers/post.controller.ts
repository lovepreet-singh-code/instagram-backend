import { Request, Response } from 'express';
import Post from '../models/post.models';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caption, image } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const post = await Post.create({
      caption,
      image,
      user: userId,
    });

    res.status(201).json({ message: 'Post created', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePicture'); // optional: if user info is needed

    const total = await Post.countDocuments();

    res.status(200).json({
      total,
      page,
      limit,
      posts,
    });
  } catch (error) {
    console.error('❌ Error in getAllPosts:', error); // ✅ Add this line
    if (error instanceof Error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    } else {
      res.status(500).json({ message: 'Server error', error });
    }
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate('user', 'username profilePicture');

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error('❌ Error in getPostById:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};