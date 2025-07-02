import express from 'express';
import {  updateProfile,
         getMyProfile,
         followUser,
         unfollowUser,
         getFollowers,
         getFollowing,
         searchUsers,
        deleteUser } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateProfile); 
router.post('/:id/follow', protect, followUser);       
router.post('/:id/unfollow', protect, unfollowUser);
router.get('/:id/followers', getFollowers);        
router.get('/:id/following', getFollowing);       
router.get('/search/users', searchUsers);     
router.delete('/delete', protect, deleteUser); 
export default router;
