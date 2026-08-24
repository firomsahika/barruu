import { prisma } from '../lib/prisma';
import slugify from 'slug';
import { z } from 'zod';
import { createArticleSchema, updateArticleSchema } from '../validations/article.validation';

export class ArticleService {
  static calculateReadingTime(content: string): number {
    const wordsPerMinute = 100;
    const wordCount = content.split(/\\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  static async getArticles(query: any, userId?: string) {
    const {
      page = '1',
      limit = '10',
      category,
      tag,
      sort = 'latest',
      search,
      author,
      featured,
    } = query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { published: true };

    if (category) where.category = category as string;
    if (featured === 'true') where.featured = true;
    if (author) where.author = { username: author };

    if (tag) {
      where.tags = { some: { tag: { slug: tag as string } } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { excerpt: { contains: search as string, mode: 'insensitive' } },
        { author: { name: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'top') {
      orderBy = { reactions: { _count: 'desc' } };
    } else if (sort === 'relevant') {
      orderBy = { viewCount: 'desc' };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          author: { select: { id: true, name: true, username: true, avatarUrl: true } },
          tags: { include: { tag: true } },
          _count: { select: { reactions: true, comments: true, bookmarks: true } }
        }
      }),
      prisma.article.count({ where })
    ]);

    let articlesWithStatus = articles;

    if (userId) {
      const reactionData = await prisma.reaction.findMany({
        where: { userId, articleId: { in: articles.map(a => a.id) } }
      });
      const bookmarkData = await prisma.bookmark.findMany({
        where: { userId, articleId: { in: articles.map(a => a.id) } }
      });

      const reactionMap = new Map(reactionData.map(r => [`${r.articleId}-${r.type}`, true]));
      const bookmarkSet = new Set(bookmarkData.map(b => b.articleId));

      articlesWithStatus = articles.map(a => ({
        ...a,
        userReactions: {
          liked: reactionMap.has(`${a.id}-LIKE`),
          unicorned: reactionMap.has(`${a.id}-UNICORN`),
        },
        userBookmarked: bookmarkSet.has(a.id),
      })) as any;
    }

    return {
      articles: articlesWithStatus,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      }
    };
  }

  static async getArticleBySlug(slug: string, userId?: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true, name: true, username: true, avatarUrl: true, bio: true, createdAt: true,
            _count: { select: { articles: true } }
          }
        },
        tags: { include: { tag: true } },
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, username: true, avatarUrl: true } },
            replies: {
              include: { author: { select: { id: true, name: true, username: true, avatarUrl: true } } },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { reactions: true, comments: true, bookmarks: true } },
        reactions: { select: { type: true, userId: true } }
      }
    });

    if (!article) throw new Error('Barruu hin argamne');
    if (!article.published && article.authorId !== userId) throw new Error('Barruu kana ilaalu hin dandeeysuu');

    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    });

    const reactionCounts = {
      likes: article.reactions.filter(r => r.type === 'LIKE').length,
      unicorns: article.reactions.filter(r => r.type === 'UNICORN').length,
    };

    let userReactions = { liked: false, unicorned: false };
    let userBookmarked = false;
    if (userId) {
      const userRx = article.reactions.filter(r => r.userId === userId);
      const bookmarked = await prisma.bookmark.findUnique({
        where: { userId_articleId: { userId, articleId: article.id } }
      });
      userBookmarked = !!bookmarked;
      userReactions = {
        liked: userRx.some(r => r.type === 'LIKE'),
        unicorned: userRx.some(r => r.type === 'UNICORN'),
      };
    }

    return { ...article, reactionCounts, userReactions, userBookmarked };
  }

  static async createArticle(data: z.infer<typeof createArticleSchema>, userId: string) {
    const { title, content, excerpt, coverImageUrl, audioUrl, category, tags, published } = data;

    const baseSlug = slugify(title, { lower: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const readingTime = this.calculateReadingTime(content);

    return prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200).replace(/<[^>]*>/g, '') + '...',
        coverImageUrl: coverImageUrl || null,
        audioUrl: audioUrl || null,
        category: category as any || 'ASOOSAMA',
        readingTime,
        published: Boolean(published),
        authorId: userId,
        tags: tags && tags.length > 0 ? {
          create: await Promise.all(
            tags.map(async (tagName: string) => {
              const tagSlug = slugify(tagName, { lower: true });
              const tag = await prisma.tag.upsert({
                where: { slug: tagSlug },
                update: {},
                create: { name: tagName, slug: tagSlug }
              });
              return { tagId: tag.id };
            })
          )
        } : undefined,
      },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { reactions: true, comments: true } }
      }
    });
  }

  static async updateArticle(data: z.infer<typeof updateArticleSchema>, userId: string, articleId: string) {
    // 1. Fetch existing article to verify ownership and existing values
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      throw new Error('ARTICLE_NOT_FOUND');
    }

    if (existingArticle.authorId !== userId) {
      throw new Error('UNAUTHORIZED');
    }

    // 2. Destructure optional update fields
    const { title, content, excerpt, coverImageUrl, audioUrl, category, tags, published, featured } = data;

    // 3. Handle slug update ONLY if title was provided and actually changed
    let slug = existingArticle.slug;
    if (title && title !== existingArticle.title) {
      const baseSlug = slugify(title, { lower: true });
      slug = baseSlug;
      let counter = 1;

      while (await prisma.article.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
      }
    }

    // 4. Handle reading time ONLY if content was updated
    const readingTime = content ? this.calculateReadingTime(content) : undefined;

    // 5. Handle tags update ONLY if tags array was explicitly passed
    let tagsUpdate = undefined;
    if (tags) {
      // Delete old join records and re-create new ones
      tagsUpdate = {
        deleteMany: {},
        create: await Promise.all(
          tags.map(async (tagName: string) => {
            const tagSlug = slugify(tagName, { lower: true });
            const tag = await prisma.tag.upsert({
              where: { slug: tagSlug },
              update: {},
              create: { name: tagName, slug: tagSlug },
            });
            return { tagId: tag.id };
          })
        ),
      };
    }

    // 6. Execute dynamic update
    return prisma.article.update({
      where: { id: articleId },
      data: {
        ...(title !== undefined && { title }),
        ...(title !== undefined && { slug }),
        ...(content !== undefined && { content }),
        ...(readingTime !== undefined && { readingTime }),
        ...(excerpt !== undefined && { excerpt }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(audioUrl !== undefined && { audioUrl }),
        ...(category !== undefined && { category }),
        ...(published !== undefined && { published: Boolean(published) }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(tagsUpdate && { tags: tagsUpdate }),
      },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { reactions: true, comments: true } },
      },
    });
  }

  static async deleteArticle(articleId: string, userId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error('ARTICLE_NOT_FOUND');
    }

    if (article.authorId !== userId) {
      throw new Error('UNAUTHORIZED');
    }

    return prisma.article.delete({
      where: { id: articleId },
    });
  }

  // react to article like or unicorn
  static async reactArticle(
    articleId: string,
    userId: string,
    type: 'LIKE' | 'UNICORN'
  ) {
    // 1. Ensure article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error('ARTICLE_NOT_FOUND');
    }

    // 2. Check if reaction already exists
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_articleId_type: {
          userId,
          articleId,
          type,
        },
      },
    });

    // 3. Toggle: Delete if it exists, Create if it doesn't
    if (existingReaction) {
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });

      return { action: 'REMOVED', type };
    } else {
      const newReaction = await prisma.reaction.create({
        data: {
          userId,
          articleId,
          type,
        },
      });

      return { action: 'ADDED', reaction: newReaction };
    }
  }

  // comment article 

  static async commentArticle(
    articleId: string,
    userId: string,
    content: string,
    parentId?: string
  ) {
    // 1. Input sanitization
    const trimmedContent = content?.trim();
    if (!trimmedContent) {
      throw new Error('INVALID_COMMENT_CONTENT');
    }

    // 2. Verify article exists
    const articleExists = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!articleExists) {
      throw new Error('ARTICLE_NOT_FOUND');
    }

    // 3. If it's a reply, verify parent comment exists and belongs to the same article
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, articleId: true },
      });

      if (!parentComment || parentComment.articleId !== articleId) {
        throw new Error('PARENT_COMMENT_NOT_FOUND');
      }
    }

    // 4. Create comment using correct foreign keys matching your model
    return prisma.comment.create({
      data: {
        content: trimmedContent,
        articleId,
        authorId: userId, // Matches 'authorId' in your Comment model
        parentId: parentId || null,
      },
      include: {
        author: { // Matches 'author' relation in your Comment model
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });
  }

  // get All comments
  static async getAllComments(articleId: string) {
    return prisma.comment.findMany({
      where: { articleId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });
}

 // delete comment by comment Id
  static async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('COMMENT_NOT_FOUND');
    }

    if(comment.authorId !== userId){
      throw new Error('UNAUTHORIZED');
    }

    return prisma.comment.delete({
      where: { id: commentId },
    });
  }


  // get replies
  static async getReplies(commentId: string) {
    return prisma.comment.findMany({
      where: { parentId: commentId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });
} 

  // deleteReply
  static async deleteReply(replyId: string, userId: string){
    const reply = await prisma.comment.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      throw new Error('REPLY_NOT_FOUND');
    }

    if(reply.authorId !== userId){
      throw new Error('UNAUTHORIZED');
    }

    return prisma.comment.delete({
      where: { id: replyId },
    }); 
  }

  // like comment
  // static async likeComment(commentId: string, userId: string) {
  //   return prisma.comment.update({
  //     where: { id: commentId },
  //     data: {
  //       likes: {
  //         connect: { id: userId },
  //       },
  //     },
  //   });
  // }

  // unlike comment
  // static async unlikeComment(commentId: string, userId: string) {
  //   return prisma.comment.update({
  //     where: { id: commentId },
  //     data: {
  //       likes: {
  //         disconnect: { id: userId },
  //       },
  //     },
  //   });
  // }

}


