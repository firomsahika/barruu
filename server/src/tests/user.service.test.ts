import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { UserService } from '../services/user.service';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

describe('UserService Unit & Integration Tests', () => {
  const originalUserFindUnique = prisma.user.findUnique;
  const originalReactionCount = prisma.reaction.count;
  const originalFollowCreate = prisma.follow.create;
  const originalFollowDelete = prisma.follow.delete;
  const originalFollowFindMany = prisma.follow.findMany;

  beforeEach(() => {
    // Reset any mocks
  });

  afterEach(() => {
    (prisma.user as any).findUnique = originalUserFindUnique;
    (prisma.reaction as any).count = originalReactionCount;
    (prisma.follow as any).create = originalFollowCreate;
    (prisma.follow as any).delete = originalFollowDelete;
    (prisma.follow as any).findMany = originalFollowFindMany;
  });

  describe('getUserProfile', () => {
    test('returns user profile with computed total reactions', async () => {
      (prisma.user as any).findUnique = async () => ({
        id: 'user-1',
        username: 'caalaa',
        name: 'Caalaa Bultum',
        articles: [{ id: 'art-1', title: 'Barruu Tokkoffaa' }],
        _count: { articles: 1, comments: 2 },
      });

      (prisma.reaction as any).count = async () => 42;

      const profile = await UserService.getUserProfile('caalaa');
      assert.equal(profile.id, 'user-1');
      assert.equal(profile.username, 'caalaa');
      assert.equal(profile.totalReactions, 42);
    });

    test('throws AppError.notFound when user does not exist', async () => {
      (prisma.user as any).findUnique = async () => null;

      await assert.rejects(
        () => UserService.getUserProfile('nonexistent'),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 404);
          assert.equal(err.errorCode, 'USER_NOT_FOUND');
          return true;
        }
      );
    });
  });

  describe('followUser', () => {
    test('throws error when user tries to follow themselves', async () => {
      await assert.rejects(
        () => UserService.followUser('user-1', 'user-1'),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 400);
          assert.equal(err.errorCode, 'CANNOT_FOLLOW_SELF');
          return true;
        }
      );
    });

    test('throws not found error when target user does not exist', async () => {
      (prisma.user as any).findUnique = async () => null;

      await assert.rejects(
        () => UserService.followUser('user-1', 'user-999'),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 404);
          assert.equal(err.errorCode, 'USER_NOT_FOUND');
          return true;
        }
      );
    });

    test('successfully creates follow relationship', async () => {
      (prisma.user as any).findUnique = async () => ({ id: 'user-2' });
      (prisma.follow as any).create = async (args: any) => ({
        followerId: args.data.followerId,
        followeeId: args.data.followeeId,
        createdAt: new Date(),
      });

      const result = await UserService.followUser('user-1', 'user-2');
      assert.equal(result.followerId, 'user-1');
      assert.equal(result.followeeId, 'user-2');
    });

    test('handles already following conflict (P2002)', async () => {
      (prisma.user as any).findUnique = async () => ({ id: 'user-2' });
      (prisma.follow as any).create = async () => {
        const error = new Error('Unique constraint failed') as any;
        error.code = 'P2002';
        throw error;
      };

      await assert.rejects(
        () => UserService.followUser('user-1', 'user-2'),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 409);
          assert.equal(err.errorCode, 'ALREADY_FOLLOWING');
          return true;
        }
      );
    });
  });

  describe('unfollowUser', () => {
    test('throws error when user tries to unfollow themselves', async () => {
      await assert.rejects(
        () => UserService.unfollowUser('user-1', 'user-1'),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 400);
          assert.equal(err.errorCode, 'CANNOT_UNFOLLOW_SELF');
          return true;
        }
      );
    });

    test('successfully removes follow relationship', async () => {
      (prisma.follow as any).delete = async () => ({
        followerId: 'user-1',
        followeeId: 'user-2',
      });

      const result = await UserService.unfollowUser('user-1', 'user-2');
      assert.equal(result.followerId, 'user-1');
      assert.equal(result.followeeId, 'user-2');
    });

    test('handles not following error when record does not exist (P2025)', async () => {
      (prisma.follow as any).delete = async () => {
        const error = new Error('Record to delete does not exist') as any;
        error.code = 'P2025';
        throw error;
      };

      await assert.rejects(
        () => UserService.unfollowUser('user-1', 'user-2'),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 400);
          assert.equal(err.errorCode, 'NOT_FOLLOWING');
          return true;
        }
      );
    });
  });

  describe('getFollowers and getFollowing', () => {
    test('getFollowers returns flattened list with followedAt', async () => {
      (prisma.user as any).findUnique = async () => ({ id: 'user-1' });
      const now = new Date();
      (prisma.follow as any).findMany = async () => [
        {
          createdAt: now,
          follower: {
            id: 'follower-1',
            name: 'Hawwi',
            username: 'hawwi',
            avatarUrl: null,
            bio: 'Barreessituu',
          },
        },
      ];

      const followers = await UserService.getFollowers('user-1');
      assert.equal(followers.length, 1);
      assert.equal(followers[0].username, 'hawwi');
      assert.equal(followers[0].followedAt, now);
    });

    test('getFollowers throws when target user does not exist', async () => {
      (prisma.user as any).findUnique = async () => null;

      await assert.rejects(
        () => UserService.getFollowers('nonexistent'),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 404);
          return true;
        }
      );
    });
  });
});
