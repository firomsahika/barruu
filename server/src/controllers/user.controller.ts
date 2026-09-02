import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { updateProfileSchema } from '../validations/auth.validation';

export class UserController {

    static async me(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Hin seenin' });
                return;
            }
            const user = await UserService.me(userId);
            res.json(user);
        } catch (error: any) {
            console.error('Me error:', error);
            res.status(404).json({ error: error.message || 'Fayyadamaan hin argamne' });
        }
    }

    // update profile
    static async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Hin seenin' });
                return;
            }

            const validatedData = updateProfileSchema.parse(req.body);
            const updatedUser = await UserService.updateProfile(userId, validatedData);
            res.json(updatedUser);
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({ error: error.errors?.[0]?.message || 'Galmeen sirrii miti' });
                return;
            }

            console.error('Update profile error:', error);

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

    static async getUserProfile(req: Request, res: Response) {
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
            console.error('Get user profile error:', error);
            res.status(404).json({ error: error.message || 'Fayyadamaan hin argamne' });
        }
    }

    static async follow(req: Request, res: Response): Promise<void> {
        try {
            // Extract followerId from the authenticated user (protected route)
            const followerId = (req as any).user?.id;

            // Extract followeeId from request body
            const { followeeId } = req.body;

            if (!followeeId) {
                res.status(400).json({ error: 'Followee ID is required' });
                return;
            }

            await UserService.followUser(followerId, followeeId);

            res.status(200).json({
                message: 'You are now following this user'
            });
        } catch (error: any) {
            console.error('Follow error:', error);

            // Handle specific error types
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
            const followerId = (req as any).user?.id;
            const { followeeId } = req.body;

            if (!followeeId) {
                res.status(400).json({ error: 'Followee ID is required' });
                return;
            }

            await UserService.unfollowUser(followerId, followeeId);

            res.status(200).json({
                message: 'You have unfollowed this user'
            });
        } catch (error: any) {
            console.error('Unfollow error:', error);

            if (error.message === 'CANNOT_UNFOLLOW_SELF') {
                res.status(400).json({ error: 'You cannot unfollow yourself' });
            } else if (error.message === 'NOT_FOLLOWING') {
                res.status(400).json({ error: 'You are not following this user' });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    //get bookmark
    static async getUserBookmarks(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const bookmarks = await UserService.getUserBookmarks(userId);
            res.json(bookmarks);
        } catch (error: any) {
            console.error('Get user bookmarks error:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
    // get draft
    static async getUserDrafts(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const drafts = await UserService.getUserDraft(userId);
            res.json(drafts);
        } catch (error: any) {
            console.error('Get user drafts error:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    //get followers 
    static async getFollowers(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const followers = await UserService.getFollowers(userId);
            res.json(followers);
        } catch (error: any) {
            console.error('Get followers error:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    //get following
    static async getFollowing(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const following = await UserService.getFollowing(userId);
            res.json(following);
        } catch (error: any) {
            console.error('Get following error:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

}