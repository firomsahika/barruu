import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { updateProfileSchema } from '../validations/auth.validation';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';

export class UserController {
  static async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Hin seenin' });
        return;
      }
      const user = await UserService.me(userId);
      res.json(user);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Me error');
      res.status(404).json({ error: error.message || 'Fayyadamaan hin argamne' });
    }
  }

  // update profile
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Hin seenin' });
        return;
      }

      const validatedData = updateProfileSchema.parse(req.body);
      const updatedUser = await UserService.updateProfile(userId, validatedData);
      res.json(updatedUser);
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        res.status(400).json({ error: error.errors?.[0]?.message || 'Galmeen sirrii miti' });
        return;
      }

      logger.error({ err: error, route: req.path }, 'Update profile error');

      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'User not found' });
      } else if (error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(400).json({ error: 'Email already exists' });
      } else if (error.message === 'USERNAME_ALREADY_EXISTS') {
        res.status(400).json({ error: 'Username already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  static async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const rawUsername = req.params.username;
      const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;
      if (!username) {
        res.status(400).json({ error: 'Username is required' });
        return;
      }
      const user = await UserService.getUserProfile(username);
      res.json(user);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Get user profile error');
      res.status(404).json({ error: error.message || 'Fayyadamaan hin argamne' });
    }
  }

  static async follow(req: Request, res: Response): Promise<void> {
    try {
      const authUser = (req as AuthRequest).user;
      const followerId = authUser?.id;

      if (!followerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { followeeId } = req.body;
      if (!followeeId) {
        res.status(400).json({ error: 'Followee ID is required' });
        return;
      }

      await UserService.followUser(followerId, followeeId);
      await NotificationService.createNotification({
        userId: followeeId,
        actorId: followerId,
        type: 'FOLLOW',
        message: 'started following you.',
        link: `/user/${authUser.username || ''}`,
      });

      res.status(200).json({
        message: 'You are now following this user',
      });
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Follow error');

      if (error.message === 'CANNOT_FOLLOW_SELF') {
        res.status(400).json({ error: 'You cannot follow yourself' });
      } else if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'User not found' });
      } else if (error.message === 'ALREADY_FOLLOWING') {
        res.status(400).json({ error: 'You are already following this user' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  static async unfollow(req: Request, res: Response): Promise<void> {
    try {
      const followerId = (req as AuthRequest).user?.id;
      const { followeeId } = req.body;

      if (!followerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!followeeId) {
        res.status(400).json({ error: 'Followee ID is required' });
        return;
      }

      await UserService.unfollowUser(followerId, followeeId);

      res.status(200).json({
        message: 'You have unfollowed this user',
      });
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Unfollow error');

      if (error.message === 'CANNOT_UNFOLLOW_SELF') {
        res.status(400).json({ error: 'You cannot unfollow yourself' });
      } else if (error.message === 'NOT_FOLLOWING') {
        res.status(400).json({ error: 'You are not following this user' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // get bookmark
  static async getUserBookmarks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const bookmarks = await UserService.getUserBookmarks(userId);
      res.json(bookmarks);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Get user bookmarks error');
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // get draft
  static async getUserDrafts(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const drafts = await UserService.getUserDraft(userId);
      res.json(drafts);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Get user drafts error');
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // get followers 
  static async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const followers = await UserService.getFollowers(userId);
      res.json(followers);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Get followers error');
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // get following
  static async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const following = await UserService.getFollowing(userId);
      res.json(following);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Get following error');
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}