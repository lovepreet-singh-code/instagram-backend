import { Request, Response } from 'express';
import Post from '../models/post.models';
import { getCache, setCache } from '../utils/cache';

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

// export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const skip = (page - 1) * limit;

//     const posts = await Post.find()
//       .sort({ createdAt: -1 }) // latest first
//       .skip(skip)
//       .limit(limit)
//       .populate('user', 'username profilePicture'); // optional: if user info is needed

//     const total = await Post.countDocuments();

//     res.status(200).json({
//       total,
//       page,
//       limit,
//       posts,
//     });
//   } catch (error) {
//     console.error('❌ Error in getAllPosts:', error); // ✅ Add this line
//     if (error instanceof Error) {
//       res.status(500).json({ message: 'Server error', error: error.message });
//     } else {
//       res.status(500).json({ message: 'Server error', error });
//     }
//   }
// };

// export const getPostById = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;

//     const post = await Post.findById(id).populate('user', 'username profilePicture');

//     if (!post) {
//       res.status(404).json({ message: 'Post not found' });
//       return;
//     }

//     res.status(200).json({ post });
//   } catch (error) {
//     console.error('❌ Error in getPostById:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };


export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `posts:page=${page}:limit=${limit}`;

    // 1. Check Redis cache
     const cachedData = await getCache(cacheKey);
    if (cachedData) {
      res.status(200).json({ from: 'cache', ...cachedData }); // ✅ just send, don't return it
      return; // ✅ end execution
    }

    // 2. Query DB
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePicture');

    const total = await Post.countDocuments();

    const response = {
      total,
      page,
      limit,
      posts,
    };

    // 3. Store in Redis
    await setCache(cacheKey, response);

    res.status(200).json({ from: 'db', ...response });
  } catch (error) {
    console.error('❌ Error in getAllPosts:', error);
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
    const cacheKey = `post:${id}`;

    // 1. Try to get from cache
    const cachedPost = await getCache(cacheKey);
    if (cachedPost) {
      res.status(200).json({ from: 'cache', post: cachedPost });
      return;
    }

    // 2. Fetch from DB
    const post = await Post.findById(id).populate('user', 'username profilePicture');
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // 3. Save to cache
    await setCache(cacheKey, post);

    res.status(200).json({ from: 'db', post });
  } catch (error) {
    console.error('❌ Error in getPostById:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { caption, image } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.user.toString() !== userId) {
      res.status(403).json({ message: 'Unauthorized to update this post' });
      return;
    }

    // Update only provided fields
    if (caption !== undefined) post.caption = caption;
    if (image !== undefined) post.image = image;

    await post.save();
    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error('❌ Error in updatePost:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Only owner can delete
    if (post.user.toString() !== userId) {
      res.status(403).json({ message: 'Unauthorized to delete this post' });
      return;
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deletePost:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};