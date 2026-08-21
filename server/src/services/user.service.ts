import { prisma } from '../lib/prisma';


export class UserService {
    // static async getOtherProfile(userId: string) {
    //     const user = await prisma.user.findUnique({
    //         where: { id: userId },
    //         select: {
    //             id: true,
    //             email: true,
    //             username: true,
    //             name: true,
    //             role: true,
    //             avatarUrl: true,
    //             bio: true,
    //             createdAt: true,
    //             _count: {
    //                 select: {
    //                     articles: true,
    //                     comments: true,
    //                 }
    //             }
    //         }
    //     });

    //     if (!user) {
    //         throw new Error('Fayyadamaan hin argamne');
    //     }
    //     return user;
    // }

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
                    }
                },
                articles: {
                    where: { published: true },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        tags: { include: { tag: true } },
                        _count: { select: { reactions: true, comments: true } }
                    }
                }
            }
        });


        // Calculate total reactions for user's articles
        const totalReactions = await prisma.reaction.count({
            where: { article: { authorId: user?.id } }
        });

        return { ...user, totalReactions };
    }

    static async followUser(followerId: string, followeeId: string) {
        // 1. Prevent self-following
        if (followerId === followeeId) {
            throw new Error('CANNOT_FOLLOW_SELF');
        }

        // 2. Check if the user to follow actually exists
        const followeeExists = await prisma.user.findUnique({
            where: { id: followeeId },
            select: { id: true },
        });

        if (!followeeExists) {
            throw new Error('USER_NOT_FOUND');
        }

        // 3. Create follow relationship (ignore if already following)
        try {
            const follow = await prisma.follow.create({
                data: {
                    followerId,
                    followeeId,
                },
            });

            return follow;
        } catch (error: any) {
            // Prisma error code for unique constraint violation (already following)
            if (error.code === 'P2002') {
                throw new Error('ALREADY_FOLLOWING');
            }
            throw error;
        }
    }

    static async unfollowUser(followerId: string, followeeId: string) {
        if (followerId === followeeId) {
            throw new Error('CANNOT_UNFOLLOW_SELF');
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
            // Prisma error code for record to delete not found
            if (error.code === 'P2025') {
                throw new Error('NOT_FOLLOWING');
            }
            throw error;
        }
    }

    static async getFollowers(userId: string) {
        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });

        if (!userExists) {
            throw new Error('USER_NOT_FOUND');
        }

        // Get all users who follow the given userId
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

        // Map response to return flat follower objects with follow date
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
            throw new Error('USER_NOT_FOUND');
        }

        // Get all users who are followed by the given userId
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

        // Map response to return flat user objects with follow date
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
              }
            }
          }
        });
    
        if (!user) {
          throw new Error('Fayyadamaan hin argamne');
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
          }
        });
    
        if (!existingUser) {
          throw new Error('Fayyadamaan hin argamne');
        }
    
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: data,
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            role: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
          }
        });
        return updatedUser;
      }
    
      static async getUserBookmark(userId: string) {
    
        const existingUser = await prisma.user.findUnique({
          where: { id: userId }
        });
    
        if (!existingUser) {
          throw new Error('Fayyadamaan hin argamne');
        }
    
        const bookmarks = await prisma.bookmark.findMany({
          where: { userId: userId },
          include: {
            article: {
              include: {
                author: { select: { id: true, name: true, username: true, avatarUrl: true } },
                tags: { include: { tag: true } },
                _count: { select: { reactions: true, comments: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
    
        return bookmarks;
      }
    
      static async getUserDraft(userId: string) {
        const existingUser = await prisma.user.findUnique({
          where: { id: userId }
        });
    
        if (!existingUser) {
          throw new Error('Fayyadamaan hin argamne');
        }
        const drafts = await prisma.article.findMany({
          where: { authorId: userId, published: false },
          include: {
            tags: { include: { tag: true } },
            _count: { select: { reactions: true, comments: true } }
          },
          orderBy: { updatedAt: 'desc' }
        });
    
        return drafts;
      }


}