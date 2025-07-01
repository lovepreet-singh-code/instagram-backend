import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import User from '../models/user.model';
import redis from '../config/redis';
import mongoose from 'mongoose';


export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const cacheKey = `profile:${userId}`;

  // ✅ 1. Try Redis
  const cachedUser = await redis.get(cacheKey);
  if (cachedUser) {
    console.log('🔁 Returned profile from Redis');
    return res.status(200).json({ fromCache: true, user: JSON.parse(cachedUser) });
  }

  // ✅ 2. Fallback to MongoDB
  console.log('📦 Fetched profile from MongoDB');
  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  // ✅ 3. Save to Redis
  await redis.set(cacheKey, JSON.stringify(user), 'EX', 60); // cache for 60s

  res.status(200).json({ fromCache: false, user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { username, bio, profilePic } = req.body;

  if (username) user.username = username;
  if (bio) user.bio = bio;
  if (profilePic) user.profilePic = profilePic;

  const updatedUser = await user.save();

  res.status(200).json({
    message: 'Profile updated successfully',
    user: {
      _id: updatedUser._id,
      username: updatedUser.username,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
    },
  });
});


export const followUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  // ✅ 1. Check for undefined
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const currentUserId = new mongoose.Types.ObjectId(userId); // ✅ 2. Safe cast after check
  const targetUserId = new mongoose.Types.ObjectId(req.params.id);

  if (currentUserId.equals(targetUserId)) {
    return res.status(400).json({ message: "You can't follow yourself" });
  }

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (targetUser.followers.includes(currentUserId)) {
    return res.status(400).json({ message: 'Already following this user' });
  }

  targetUser.followers.push(currentUserId);
  currentUser.following.push(targetUserId);

  await targetUser.save();
  await currentUser.save();

  // ✅ 6. Invalidate Redis cache
  await redis.del(`followers:${targetUserId.toString()}`);
  await redis.del(`following:${currentUserId.toString()}`);


  res.status(200).json({ message: 'User followed successfully' });
});

export const unfollowUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  // ✅ Check if user is authenticated
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const currentUserId = new mongoose.Types.ObjectId(userId);
  const targetUserId = new mongoose.Types.ObjectId(req.params.id);

  // ❌ Prevent self-unfollow
  if (currentUserId.equals(targetUserId)) {
    return res.status(400).json({ message: "You can't unfollow yourself" });
  }

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  // ❌ Prevent unfollowing someone you're not following
  if (!targetUser.followers.includes(currentUserId)) {
    return res.status(400).json({ message: "You're not following this user" });
  }

  // ✅ Remove IDs from both arrays
  targetUser.followers = targetUser.followers.filter(
    (id) => !id.equals(currentUserId)
  );
  currentUser.following = currentUser.following.filter(
    (id) => !id.equals(targetUserId)
  );

  await targetUser.save();
  await currentUser.save();

  // ✅ 6. Invalidate Redis cache
  await redis.del(`followers:${targetUserId.toString()}`);
  await redis.del(`following:${currentUserId.toString()}`);


  res.status(200).json({ message: 'User unfollowed successfully' });
});


export const getFollowers = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const cacheKey = `followers:${userId}`;

  // 1. Try fetching from Redis cache
  const cachedFollowers = await redis.get(cacheKey);
  if (cachedFollowers) {
      console.log('🔁 Returned from Redis');
    const followers = JSON.parse(cachedFollowers);
    return res.status(200).json({
      fromCache: true,
      followers,
      count: followers.length,
    });
  }
console.log('📦 Fetched from MongoDB');

  // 2. If not in cache, fetch from DB
  const targetUser = await User.findById(userId).populate('followers', 'username profilePic');
  if (!targetUser) return res.status(404).json({ message: 'User not found' });

  // 3. Store in Redis
  await redis.set(cacheKey, JSON.stringify(targetUser.followers), 'EX', 60); // TTL: 60 sec

  res.status(200).json({
    fromCache: false,
    followers: targetUser.followers,
    count: targetUser.followers.length,
  });
});


export const getFollowing = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const cacheKey = `following:${userId}`;

  // 1. Try fetching from Redis
  const cachedFollowing = await redis.get(cacheKey);
  if (cachedFollowing) {
      console.log('🔁 Returned from Redis');
    const following = JSON.parse(cachedFollowing);
    return res.status(200).json({
      fromCache: true,
      following,
      count: following.length,
    });
  }
  console.log('📦 Fetched from MongoDB');
  // 2. If not cached, fetch from DB
  const targetUser = await User.findById(userId).populate('following', 'username profilePic');
  if (!targetUser) return res.status(404).json({ message: 'User not found' });

  // 3. Store in Redis
  await redis.set(cacheKey, JSON.stringify(targetUser.following), 'EX', 60); // Cache for 60s

  res.status(200).json({
    fromCache: false,
    following: targetUser.following,
    count: targetUser.following.length,
  });
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const keyword = req.query.q as string;

  if (!keyword) return res.status(400).json({ message: 'Missing search query' });

  const users = await User.find({
    username: { $regex: keyword, $options: 'i' },
  }).select('username profilePic');

  res.status(200).json({ users });
});
