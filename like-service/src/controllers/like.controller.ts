import { Request, Response } from 'express';
import Like from '../models/like.model';
import Post from '../models/post.model';

export const likePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = await Like.findOne({ user: userId, post: postId });
    if (alreadyLiked) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    const like = await Like.create({ user: userId, post: postId });

  

    return res.status(201).json({ message: 'Post liked', like });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error });
  }
};


export const unlikePost = async (req: Request, res: Response) => {
  const { postId } = req.body;
  const userId = (req as any).userId;

  const removed = await Like.findOneAndDelete({ user: userId, post: postId });
  if (!removed) return res.status(404).json({ message: 'Like not found' });

  res.status(200).json({ message: 'Post unliked' });
};

export const getPostLikes = async (req: Request, res: Response) => {
  const { postId } = req.params;

  const likes = await Like.find({ post: postId }).populate('user', 'username profilePic');
  res.status(200).json({ count: likes.length, likes });
};

export const isPostLiked = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { postId } = req.params;

  const liked = await Like.exists({ user: userId, post: postId });

  res.status(200).json({ liked: !!liked });
};

export const getUserLikedPosts = async (req: Request, res: Response): Promise<void> => {

  const userId = (req as any).userId;

  const likedPosts = await Like.find({ user: userId }).select('post -_id');

  const postIds = likedPosts.map((like) => like.post);

  res.status(200).json({
    message: 'Liked posts fetched successfully',
    posts: postIds,
  });
};


export const getLikedPostsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const authUserId = (req as any).userId;

  if (userId !== authUserId) {
    return res.status(403).json({ message: 'Forbidden: You can only view your own liked posts' });
  }

  const likedPosts = await Like.find({ user: userId }).select('post -_id');
  const postIds = likedPosts.map((like) => like.post);

  return res.status(200).json({
    message: 'Liked posts fetched successfully',
    posts: postIds,
  });
};
