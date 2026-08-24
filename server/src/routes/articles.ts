import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import slugify from 'slug';
import { ArticleController } from '../controllers/article.controller';
import { NotificationService } from '../services/notification.service';
import { ArticleService } from '../services/article.service';

const router = Router();
const calculateReadingTime = ArticleService.calculateReadingTime;

// GET /api/articles - Get all articles with pagination & filtering
router.get('/', optionalAuth, ArticleController.getArticles);

// GET /api/articles/:slug - Get single article
router.get('/:slug', optionalAuth, ArticleController.getArticle);

// POST /api/articles - Create article
router.post('/', authenticate, ArticleController.createArticle);



// PATCH /api/articles/:id - Update article
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, coverImageUrl, audioUrl, category, tags, published, featured } = req.body;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Barruu hin argamne' });
      return;
    }

    if (existing.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Hayyama hin qabdu' });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      updateData.content = content;
      updateData.readingTime = calculateReadingTime(content);
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
    if (category !== undefined) updateData.category = category;
    if (published !== undefined) updateData.published = published;
    if (featured !== undefined && req.user!.role === 'ADMIN') updateData.featured = featured;

    // Handle tags
    if (tags !== undefined) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });
      if (tags.length > 0) {
        for (const tagName of tags) {
          const tagSlug = slugify(tagName, { lower: true });
          const tag = await prisma.tag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: { name: tagName, slug: tagSlug }
          });
          await prisma.articleTag.create({ data: { articleId: id, tagId: tag.id } });
        }
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { reactions: true, comments: true } }
      }
    });

    res.json(article);
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

// DELETE /api/articles/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Barruu hin argamne' });
      return;
    }

    if (existing.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Hayyama hin qabdu' });
      return;
    }

    await prisma.article.delete({ where: { id } });
    res.json({ message: 'Barruu haqame' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

// POST /api/articles/:id/react - Toggle reaction
router.post('/:id/react', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'LIKE' or 'UNICORN'

    if (!['LIKE', 'UNICORN'].includes(type)) {
      res.status(400).json({ error: 'Akaaka simatamee hin jiru' });
      return;
    }

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      res.status(404).json({ error: 'Barruu hin argamne' });
      return;
    }

    const existing = await prisma.reaction.findUnique({
      where: { userId_articleId_type: { userId: req.user!.id, articleId: id, type } }
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      res.json({ reacted: false, type });
    } else {
      await prisma.reaction.create({
        data: { userId: req.user!.id, articleId: id, type }
      });
      
      // Notify the article author
      await NotificationService.createNotification({
        userId: article.authorId,
        actorId: req.user!.id,
        type: type === 'LIKE' ? 'LIKE' : 'UNICORN',
        message: `Someone reacted to your article.`,
        link: `/article/${article.slug}`
      });

      res.json({ reacted: true, type });
    }
  } catch (error) {
    console.error('React error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

// POST /api/articles/:id/bookmark - Toggle bookmark
router.post('/:id/bookmark', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      res.status(404).json({ error: 'Barruu hin argamne' });
      return;
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_articleId: { userId: req.user!.id, articleId: id } }
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      res.json({ bookmarked: false });
    } else {
      await prisma.bookmark.create({
        data: { userId: req.user!.id, articleId: id }
      });
      res.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

// POST /api/articles/:id/comments - Add comment
router.post('/:id/comments', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: 'Yaada barreessaa' });
      return;
    }

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      res.status(404).json({ error: 'Barruu hin argamne' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user!.id,
        articleId: id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          }
        }
      }
    });

    // Notify the article author
    await NotificationService.createNotification({
      userId: article.authorId,
      actorId: req.user!.id,
      type: 'COMMENT',
      message: `Someone commented on your article.`,
      link: `/article/${article.slug}#comments`
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

export default router;
