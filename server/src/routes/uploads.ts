import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadImage } from '../services/upload.service';
import multer from 'multer';
import { logger } from '../lib/logger';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    callback(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype));
  },
});

router.post('/image', authenticate, upload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { folder } = req.body as { folder?: unknown };

    if (!req.file) {
      res.status(400).json({ error: 'Fakkii filadhu' });
      return;
    }

    if (folder !== 'avatars' && folder !== 'article-covers') {
      res.status(400).json({ error: 'Bakka kuusaa fakkii sirrii miti' });
      return;
    }

    const result = await uploadImage(req.file.buffer, req.file.mimetype, folder);
    res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (error: any) {
    if (error.message === 'CLOUDINARY_NOT_CONFIGURED') {
      res.status(503).json({ error: 'Cloudinary hin qophoofne' });
      return;
    }
    if (error.message === 'INVALID_IMAGE') {
      res.status(400).json({ error: 'Gosti fakkii sirrii miti. JPG, PNG, WebP ykn GIF fayyadami.' });
      return;
    }
    if (error.message === 'IMAGE_TOO_LARGE') {
      res.status(413).json({ error: 'Fakkiin guddaan 5MB caaluu hin qabu' });
      return;
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'Fakkiin guddaan 5MB caaluu hin qabu' });
      return;
    }
    logger.error({ err: error, route: req.path }, 'Image upload error');
    res.status(500).json({ error: 'Fakkii olkaa\'uu hin dandeenye' });
  }
});

export default router;
