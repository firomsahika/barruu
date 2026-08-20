import { Request, Response } from 'express';
import { ArticleService } from '../services/article.service';
import { createArticleSchema, updateArticleSchema } from '../validations/article.validation';

export class ArticleController {
  static async getArticles(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const result = await ArticleService.getArticles(req.query, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Get articles error:', error);
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  static async getArticle(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const userId = (req as any).user?.id;
      const result = await ArticleService.getArticleBySlug(slug, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Get article error:', error);
      res.status(404).json({ error: error.message || 'Barruu hin argamne' });
    }
  }

  static async createArticle(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createArticleSchema.parse(req.body);
      const userId = (req as any).user?.id;
      const result = await ArticleService.createArticle(validatedData, userId);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error('Create article error:', error);
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  // We can add the other controller methods here
}
