import express from 'express';
import { likePost,
     unlikePost,
      getPostLikes,
     isPostLiked,
     getUserLikedPosts,
   getLikedPostsByUser

 } from '../controllers/like.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';


const router = express.Router();

router.post('/like', authenticate, asyncHandler(likePost));
router.post('/unlike', authenticate, asyncHandler(unlikePost));
router.get('/:postId/isLiked', authenticate, asyncHandler(isPostLiked));
router.get('/user-liked-posts', authenticate, asyncHandler(getUserLikedPosts));
router.get('/:postId', asyncHandler(getPostLikes));
router.get('/user/:userId', authenticate, asyncHandler(getLikedPostsByUser));


export default router;
