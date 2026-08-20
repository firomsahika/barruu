import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

// GET /api/users/:username - Get user profile
router.get('/:username', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

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

    if (!user) {
      res.status(404).json({ error: 'Fayyadamaan hin argamne' });
      return;
    }

    // Calculate total reactions for user's articles
    const totalReactions = await prisma.reaction.count({
      where: { article: { authorId: user.id } }
    });

    res.json({ ...user, totalReactions });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

// PATCH /api/users/me/profile - Update profile
router.patch('/me/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, bio, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        role: true,
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

// GET /api/users/me/bookmarks - Get user bookmarks
router.get('/me/bookmarks', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user!.id },
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

    res.json(bookmarks.map(b => b.article));
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

// GET /api/users/me/drafts - Get user drafts
router.get('/me/drafts', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drafts = await prisma.article.findMany({
      where: { authorId: req.user!.id, published: false },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { reactions: true, comments: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(drafts);
  } catch (error) {
    console.error('Get drafts error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

// PATCH /api/users/me/password - Change password
router.patch('/me/password', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ error: 'Fayyadamaan hin argamne' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      res.status(400).json({ error: 'Jecha darbii ammaa hin sirre' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Jecha darbii jijjiirameera' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

export default router;
