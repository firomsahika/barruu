import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/tags - Get all tags
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: { select: { articles: true } }
      },
      orderBy: { articles: { _count: 'desc' } }
    });
    res.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

// GET /api/tags/:slug - Get tag with articles
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        articles: {
          include: {
            article: {
              include: {
                author: { select: { id: true, name: true, username: true, avatarUrl: true } },
                _count: { select: { reactions: true, comments: true } }
              }
            }
          }
        }
      }
    });

    if (!tag) {
      res.status(404).json({ error: 'Tag hin argamne' });
      return;
    }

    res.json(tag);
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

export default router;
