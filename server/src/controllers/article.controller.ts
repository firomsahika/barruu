import { Request, Response } from 'express';
import { ArticleService } from '../services/article.service';
import { createArticleSchema, updateArticleSchema } from '../validations/article.validation';
import { articleQuerySchema } from '../validations/articleQuery.validation';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';

export class ArticleController {
  static async getArticles(req: Request, res: Response): Promise<void> {
    try {
      const validatedQuery = articleQuerySchema.parse(req.query);
      const userId = (req as AuthRequest).user?.id;
      const result = await ArticleService.getArticles(validatedQuery, userId);
      res.json(result);
    } catch (error: any) {
      if (error?.name === 'ZodError' || error?.issues) {
        const msg = error.issues?.[0]?.message || error.errors?.[0]?.message || 'Gaaffii dogoggoraa';
        res.status(400).json({ error: msg });
        return;
      }
      logger.error({ err: error, route: req.path }, 'Get articles error');
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  static async getArticle(req: Request, res: Response): Promise<void> {
    try {
      const rawSlug = req.params.slug;
      const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

      const userId = (req as AuthRequest).user?.id;
      const result = await ArticleService.getArticleBySlug(slug, userId);
      res.json(result);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Get article error');
      res.status(404).json({ error: error.message || 'Barruu hin argamne' });
    }
  }

  static async getArticleById(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Seena - mirkaneessa barbaachisa' });
        return;
      }
      const result = await ArticleService.getArticleById(id, userId);
      res.json(result);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Get article by ID error');
      res.status(404).json({ error: 'Barruun hin argamne' });
    }
  }

  static async createArticle(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createArticleSchema.parse(req.body);
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Seena - mirkaneessa barbaachisa' });
        return;
      }
      const result = await ArticleService.createArticle(validatedData, userId);
      res.status(201).json(result);
    } catch (error: any) {
      if (error?.name === 'ZodError' || error?.issues) {
        const msg = error.issues?.[0]?.message || error.errors?.[0]?.message || 'Galmeen sirrii miti';
        res.status(400).json({ error: msg });
        return;
      }
      logger.error({ err: error, route: req.path }, 'Create article error');
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  // update Article
  static async updateArticle(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.articleId || req.params.id;
      const articleId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!articleId) {
        res.status(400).json({ error: "Id'n barruu ni barbaachisa" });
        return;
      }

      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      const validatedData = updateArticleSchema.parse(req.body);
      const result = await ArticleService.updateArticle(validatedData, userId, articleId);

      res.status(200).json(result);
    } catch (error: any) {
      if (error?.name === 'ZodError' || error?.issues) {
        const msg = error.issues?.[0]?.message || error.errors?.[0]?.message || 'Galmeen sirrii miti';
        res.status(400).json({ error: msg });
        return;
      }

      if (error.message === 'ARTICLE_NOT_FOUND') {
        res.status(404).json({ error: 'Barruun hin argamne' });
        return;
      }

      if (error.message === 'UNAUTHORIZED') {
        res.status(403).json({ error: 'Barruu kana fooyyessuuf heeyyama hin qabdu' });
        return;
      }

      logger.error({ err: error, route: req.path }, 'Update article error');
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  // deleteArticle 
  static async deleteArticle(req: Request, res: Response): Promise<void> {
    try {
      const rawArticleId = req.params.articleId || req.params.id;
      const articleId = Array.isArray(rawArticleId) ? rawArticleId[0] : rawArticleId;

      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      const result = await ArticleService.deleteArticle(articleId, userId);
      res.json(result);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Delete article error');
      res.status(404).json({ error: error.message || 'Barruun hin argamne' });
    }
  }

  // reactArticle
  static async reactArticle(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.articleId || req.params.id;
      const articleId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!articleId) {
        res.status(400).json({ error: "Id'n barruu ni barbaachisa" });
        return;
      }

      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      const { type } = req.body;
      if (!type || !['LIKE', 'UNICORN'].includes(type)) {
        res.status(400).json({ error: "Gosa re'aakshooni sirrii miti" });
        return;
      }

      const result = await ArticleService.reactArticle(articleId, userId, type);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'React article error');

      if (error.message === 'ARTICLE_NOT_FOUND') {
        res.status(404).json({ error: 'Barruun hin argamne' });
        return;
      }

      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  // comment article
  static async commentArticle(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.articleId || req.params.id;
      const articleId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!articleId) {
        res.status(400).json({ error: "Id'n barruu ni barbaachisa" });
        return;
      }

      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      const { content, parentId } = req.body;

      const result = await ArticleService.commentArticle(
        articleId,
        userId,
        content,
        parentId
      );

      res.status(201).json(result);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Comment article error');

      if (error.message === 'INVALID_COMMENT_CONTENT') {
        res.status(400).json({ error: 'Yaada keessan barreessaa' });
        return;
      }

      if (error.message === 'PARENT_COMMENT_NOT_FOUND') {
        res.status(404).json({ error: 'Deebiin kennamuuf yaadni argamne' });
        return;
      }

      if (error.message === 'ARTICLE_NOT_FOUND') {
        res.status(404).json({ error: 'Barruun hin argamne' });
        return;
      }

      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  // get all comments 
  static async getAllComments(req: Request, res: Response): Promise<void> {
    try {
      const rawArticleId = req.params.articleId || req.params.id;
      const articleId = Array.isArray(rawArticleId) ? rawArticleId[0] : rawArticleId;

      if (!articleId) {
        res.status(400).json({ error: "Id'n barruu ni barbaachisa" });
        return;
      }

      const result = await ArticleService.getAllComments(articleId);
      res.json(result);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Get comments error');
      res.status(404).json({ error: error.message || 'Yaadawwan hin argamne' });
    }
  }

  // delete comment
  static async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const rawCommentId = req.params.commentId || req.params.id;
      const commentId = Array.isArray(rawCommentId) ? rawCommentId[0] : rawCommentId;

      if (!commentId) {
        res.status(400).json({ error: "Id'n yaadaa ni barbaachisa" });
        return;
      }

      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      const result = await ArticleService.deleteComment(commentId, userId);
      res.json(result);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Delete comment error');
      res.status(404).json({ error: error.message || 'Yaada hin argamne' });
    }
  }

  // get replies
  static async getReplies(req: Request, res: Response): Promise<void> {
    try {
      const rawCommentId = req.params.commentId || req.params.id;
      const commentId = Array.isArray(rawCommentId) ? rawCommentId[0] : rawCommentId;

      if (!commentId) {
        res.status(400).json({ error: "Id'n yaadaa ni barbaachisa" });
        return;
      }

      const result = await ArticleService.getReplies(commentId);
      res.json(result);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Get replies error');
      res.status(404).json({ error: error.message || 'Deebiiwwan hin argamne' });
    }
  }

  // delete reply
  static async deleteReply(req: Request, res: Response): Promise<void> {
    try {
      const rawReplyId = req.params.replyId || req.params.id;
      const replyId = Array.isArray(rawReplyId) ? rawReplyId[0] : rawReplyId;

      if (!replyId) {
        res.status(400).json({ error: "Id'n deebii ni barbaachisa" });
        return;
      }

      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      const result = await ArticleService.deleteReply(replyId, userId);
      res.json(result);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Delete reply error');
      res.status(404).json({ error: error.message || 'Deebii hin argamne' });
    }
  }
}
