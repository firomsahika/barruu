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
      const rawSlug = req.params.slug;
      const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

      const userId = (req as any).user?.id;
      const result = await ArticleService.getArticleBySlug(slug, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Get article error:', error);
      res.status(404).json({ error: error.message || 'Barruu hin argamne' });
    }
  }

  static async getArticleById(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Seena - mirkaneessa barbaachisa' });
        return;
      }
      const result = await ArticleService.getArticleById(id, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Get article by ID error:', error);
      res.status(404).json({ error: 'Barruun hin argamne' });
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

  // update Article
  static async updateArticle(req: Request, res: Response): Promise<void> {
    try {
      // Extract parameter safely (handles both /:articleId and /:id route definitions)
      const rawId = req.params.articleId || req.params.id;
      const articleId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!articleId) {
        res.status(400).json({ error: 'Id\'n barruu ni barbaachisa' });
        return;
      }

      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      const validatedData = updateArticleSchema.parse(req.body);
      const result = await ArticleService.updateArticle(validatedData, userId, articleId);

      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors[0].message });
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

      console.error('Update article error:', error);
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  //deleteArticle 
  static async deleteArticle(req: Request, res: Response): Promise<void> {
    try {
      const rawArticleId = req.params.articleId || req.params.id;
      const articleId = Array.isArray(rawArticleId) ? rawArticleId[0] : rawArticleId;

      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      const result = await ArticleService.deleteArticle(articleId, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Delete article error:', error);
      res.status(404).json({ error: error.message || 'Barruun hin argamne' });
    }
  }

  //reactArticle
  static async reactArticle(req: Request, res: Response): Promise<void> {
    try {
      // 1. Safely extract articleId from route params (/articles/:articleId or /articles/:id)
      const rawId = req.params.articleId || req.params.id;
      const articleId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!articleId) {
        res.status(400).json({ error: 'Id\'n barruu ni barbaachisa' });
        return;
      }

      // 2. Validate user authentication
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      // 3. Extract and validate reaction type from request body
      const { type } = req.body;
      if (!type || !['LIKE', 'UNICORN'].includes(type)) {
        res.status(400).json({ error: 'Gosa re\'aakshooni sirrii miti' });
        return;
      }

      // 4. Pass all 3 required arguments to service
      const result = await ArticleService.reactArticle(articleId, userId, type);

      res.status(200).json(result);
    } catch (error: any) {
      console.error('React article error:', error);

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
      // 1. Extract articleId from route params (/articles/:articleId or /articles/:id)
      const rawId = req.params.articleId || req.params.id;
      const articleId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!articleId) {
        res.status(400).json({ error: 'Id\'n barruu ni barbaachisa' });
        return;
      }

      // 2. Validate user authentication
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      // 3. Extract content and optional parentId from request body
      const { content, parentId } = req.body;

      // 4. Call the comment service with all required arguments
      const result = await ArticleService.commentArticle(
        articleId,
        userId,
        content,
        parentId
      );

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Comment article error:', error);

      // Match service error cases cleanly
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

  //get all comments 
  static async getAllComments(req: Request, res: Response): Promise<void> {
    try {
      const rawArticleId = req.params.articleId || req.params.id;
      const articleId = Array.isArray(rawArticleId) ? rawArticleId[0] : rawArticleId;

      if (!articleId) {
        res.status(400).json({ error: 'Id\'n barruu ni barbaachisa' });
        return;
      }

      // const userId = (req as any).user?.id;
      // if (!userId) {
      //   res.status(401).json({ error: 'Unauthorized!' });
      //   return;
      // }

      const result = await ArticleService.getAllComments(articleId);
      res.json(result);
    } catch (error: any) {
      console.error('Get comments error:', error);
      res.status(404).json({ error: error.message || 'Yaadawwan hin argamne' });
    }
  }

  // delete comment
  static async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const rawCommentId = req.params.commentId || req.params.id;
      const commentId = Array.isArray(rawCommentId) ? rawCommentId[0] : rawCommentId;

      if (!commentId) {
        res.status(400).json({ error: 'Id\'n yaadaa ni barbaachisa' });
        return;
      }

      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      const result = await ArticleService.deleteComment(commentId, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Delete comment error:', error);
      res.status(404).json({ error: error.message || 'Yaada hin argamne' });
    }
  }

  // get replies
  static async getReplies(req: Request, res: Response): Promise<void> {
    try {
      const rawCommentId = req.params.commentId || req.params.id;
      const commentId = Array.isArray(rawCommentId) ? rawCommentId[0] : rawCommentId;

      if (!commentId) {
        res.status(400).json({ error: 'Id\'n yaadaa ni barbaachisa' });
        return;
      }

      const result = await ArticleService.getReplies(commentId);
      res.json(result);
    } catch (error: any) {
      console.error('Get replies error:', error);
      res.status(404).json({ error: error.message || 'Deebiiwwan hin argamne' });
    }
  }

  // delete reply
  static async deleteReply(req: Request, res: Response): Promise<void> {
    try {
      const rawReplyId = req.params.replyId || req.params.id;
      const replyId = Array.isArray(rawReplyId) ? rawReplyId[0] : rawReplyId;

      if (!replyId) {
        res.status(400).json({ error: 'Id\'n deebii ni barbaachisa' });
        return;
      }

      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized!' });
        return;
      }

      const result = await ArticleService.deleteReply(replyId, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Delete reply error:', error);
      res.status(404).json({ error: error.message || 'Deebii hin argamne' });
    }
  }

}
