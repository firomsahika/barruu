import Router from 'express'
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';



const router = Router();

router.get('/me', authenticate, UserController.me);
router.put('/me', authenticate, UserController.updateProfile);
router.get('/:username', UserController.getUserProfile);
router.post('/follow', authenticate, UserController.follow);
router.post('/unfollow', authenticate, UserController.unfollow);
router.get('/bookmarks', authenticate, UserController.getUserBookmarks);
router.get('/drafts', authenticate, UserController.getUserDrafts);
router.get('/followers', authenticate, UserController.getFollowers);
router.get('/following', authenticate, UserController.getFollowing);
