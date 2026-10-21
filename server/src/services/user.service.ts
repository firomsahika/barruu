import { prisma } from '../lib/prisma';
import { updateProfileSchema } from '../validations/auth.validation';
import { AppError } from '../lib/errors';
import { z } from 'zod';

export class UserService {
  static async getUserProfile(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        role: true,
        _count: {
          select: {
            articles: { where: { published: true } },
            comments: true,
          },
        },
        articles: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, name: true, username: true, avatarUrl: true } },
            tags: { include: { tag: true } },
            _count: { select: { reactions: true, comments: true } },
          },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('Fayyadamaan hin argamne', 'USER_NOT_FOUND');
    }

    const totalReactions = await prisma.reaction.count({
      where: { article: { authorId: user.id } },
    });

    return { ...user, totalReactions };
  }

  static async followUser(followerId: string, followeeId: string) {
    if (followerId === followeeId) {
      throw AppError.badRequest('Of hordofuu hin dandeessan', 'CANNOT_FOLLOW_SELF');
    }

    const followeeExists = await prisma.user.findUnique({
      where: { id: followeeId },
      select: { id: true },
    });

    if (!followeeExists) {
      throw AppError.notFound('Fayyadamaan hordofamu hin argamne', 'USER_NOT_FOUND');
    }

    try {
      const follow = await prisma.follow.create({
        data: {
          followerId,
          followeeId,
        },
      });

      return follow;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw AppError.conflict('Duraanuu hordoftaniittu', 'ALREADY_FOLLOWING');
      }
      throw error;
    }
  }

  static async unfollowUser(followerId: string, followeeId: string) {
    if (followerId === followeeId) {
      throw AppError.badRequest('Of hordofuu dhiisuu hin dandeessan', 'CANNOT_UNFOLLOW_SELF');
    }

    try {
      const unfollow = await prisma.follow.delete({
        where: {
          followerId_followeeId: {
            followerId,
            followeeId,
          },
        },
      });

      return unfollow;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw AppError.badRequest('Hordofaa hin jirtan', 'NOT_FOLLOWING');
      }
      throw error;
    }
  }

  static async getFollowers(userId: string) {
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw AppError.notFound('Fayyadamaan hin argamne', 'USER_NOT_FOUND');
    }

    const followers = await prisma.follow.findMany({
      where: { followeeId: userId },
      select: {
        createdAt: true,
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return followers.map((f) => ({
      ...f.follower,
      followedAt: f.createdAt,
    }));
  }

  static async getFollowing(userId: string) {
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw AppError.notFound('Fayyadamaan hin argamne', 'USER_NOT_FOUND');
    }

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: {
        createdAt: true,
        followee: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return following.map((f) => ({
      ...f.followee,
      followedAt: f.createdAt,
    }));
  }

  static async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            articles: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('Fayyadamaan hin argamne', 'USER_NOT_FOUND');
    }
    return user;
  }

  static async updateProfile(userId: string, data: z.infer<typeof updateProfileSchema>) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!existingUser) {
      throw AppError.notFound('Fayyadamaan hin argamne', 'USER_NOT_FOUND');
    }

    const normalizedData = {
      ...data,
      bio: data.bio !== undefined && data.bio !== null && data.bio.trim() ? data.bio.trim() : null,
      avatarUrl: typeof data.avatarUrl === 'string' && data.avatarUrl.trim() ? data.avatarUrl.trim() : null,
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: normalizedData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });
    return updatedUser;
  }

  static async getUserBookmarks(userId: string) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw AppError.notFound('Fayyadamaan hin argamne', 'USER_NOT_FOUND');
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        article: {
          include: {
            author: { select: { id: true, name: true, username: true, avatarUrl: true } },
            tags: { include: { tag: true } },
            _count: { select: { reactions: true, comments: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookmarks;
  }

  static async getUserDraft(userId: string) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw AppError.notFound('Fayyadamaan hin argamne', 'USER_NOT_FOUND');
    }
    const drafts = await prisma.article.findMany({
      where: { authorId: userId, published: false },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { reactions: true, comments: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return drafts;
  }
}