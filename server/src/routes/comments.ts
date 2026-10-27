import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';

const router = Router();

// DELETE /api/comments/:id - Delete comment
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) {
      res.status(400).json({ error: 'Comment ID is required' });
      return;
    }

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      res.status(404).json({ error: 'Yaada hin argamne' });
      return;
    }

    if (comment.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Hayyama hin qabdu' });
      return;
    }

    await prisma.comment.delete({ where: { id } });
    res.json({ message: 'Yaada haqame' });
  } catch (error) {
    logger.error({ err: error, route: req.path }, 'Delete comment error');
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

// PATCH /api/comments/:id - Update comment
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) {
      res.status(400).json({ error: 'Comment ID is required' });
      return;
    }
    const { content } = req.body;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      res.status(404).json({ error: 'Yaada hin argamne' });
      return;
    }

    if (comment.authorId !== req.user!.id) {
      res.status(403).json({ error: 'Hayyama hin qabdu' });
      return;
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } }
      }
    });

    res.json(updated);
  } catch (error) {
    logger.error({ err: error, route: req.path }, 'Update comment error');
    res.status(500).json({ error: 'Dogoggora serverii' });
  }
});

export default router;
