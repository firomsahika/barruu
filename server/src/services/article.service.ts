import { prisma } from '../lib/prisma';
import slugify from 'slug';
import { z } from 'zod';
import { createArticleSchema, updateArticleSchema } from '../validations/article.validation';

export class ArticleService {
  static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
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

    let userReactions = { liked: false, unicorned: false, bookmarked: false };
    if (userId) {
      const userRx = article.reactions.filter(r => r.userId === userId);
      const bookmarked = await prisma.bookmark.findUnique({
        where: { userId_articleId: { userId, articleId: article.id } }
      });
      userReactions = {
        liked: userRx.some(r => r.type === 'LIKE'),
        unicorned: userRx.some(r => r.type === 'UNICORN'),
        bookmarked: !!bookmarked,
      };
    }

    return { ...article, reactionCounts, userReactions };
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

  // ... Update, Delete, React, Bookmark can be similarly moved here
}
