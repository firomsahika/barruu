import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ArticleService } from '../services/article.service';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import { NotificationService } from '../services/notification.service';

describe('ArticleService Unit & Integration Tests', () => {
  const originalArticleFindMany = prisma.article.findMany;
  const originalArticleCount = prisma.article.count;
  const originalArticleFindUnique = prisma.article.findUnique;
  const originalArticleCreate = prisma.article.create;
  const originalArticleUpdate = prisma.article.update;
  const originalArticleDelete = prisma.article.delete;
  const originalReactionFindUnique = prisma.reaction.findUnique;
  const originalReactionCreate = prisma.reaction.create;
  const originalReactionDelete = prisma.reaction.delete;
  const originalBookmarkFindUnique = prisma.bookmark.findUnique;
  const originalCommentCreate = prisma.comment.create;
  const originalNotificationCreate = NotificationService.createNotification;

  afterEach(() => {
    (prisma.article as any).findMany = originalArticleFindMany;
    (prisma.article as any).count = originalArticleCount;
    (prisma.article as any).findUnique = originalArticleFindUnique;
    (prisma.article as any).create = originalArticleCreate;
    (prisma.article as any).update = originalArticleUpdate;
    (prisma.article as any).delete = originalArticleDelete;
    (prisma.reaction as any).findUnique = originalReactionFindUnique;
    (prisma.reaction as any).create = originalReactionCreate;
    (prisma.reaction as any).delete = originalReactionDelete;
    (prisma.bookmark as any).findUnique = originalBookmarkFindUnique;
    (prisma.comment as any).create = originalCommentCreate;
    NotificationService.createNotification = originalNotificationCreate;
  });

  describe('getArticles filtering & pagination', () => {
    test('filters articles by category, tag, author, and search', async () => {
      let capturedWhere: any = null;
      (prisma.article as any).findMany = async (args: any) => {
        capturedWhere = args.where;
        return [
          {
            id: 'art-1',
            title: 'Seenaa Gootota Oromoo',
            slug: 'seenaa-gootota-oromoo',
            published: true,
            reactions: [{ type: 'LIKE' }],
            comments: [],
            author: { id: 'u1', name: 'Caalaa', username: 'caalaa', avatarUrl: null },
            tags: [{ tag: { name: 'Seenaa', slug: 'seenaa' } }],
            _count: { reactions: 1, comments: 0, bookmarks: 0 },
          },
        ];
      };
      (prisma.article as any).count = async () => 1;

      const result = await ArticleService.getArticles({
        category: 'SEENAA',
        tag: 'seenaa',
        author: 'caalaa',
        search: 'Gootota',
        featured: 'true',
        page: '2',
        limit: '5',
      });

      assert.equal(result.articles.length, 1);
      assert.equal(result.pagination.total, 1);
      assert.equal(result.pagination.page, 2);
      assert.equal(result.pagination.limit, 5);
      assert.equal(capturedWhere.category, 'SEENAA');
      assert.equal(capturedWhere.featured, true);
      assert.equal(capturedWhere.author.username, 'caalaa');
    });

    test('calculates correct reading time accurately', () => {
      const shortText = 'Afaan Oromoo';
      assert.equal(ArticleService.calculateReadingTime(shortText), 1);

      const words = Array.from({ length: 250 }, () => 'jecha').join(' ');
      assert.equal(ArticleService.calculateReadingTime(words), 3);
    });
  });

  describe('getArticleBySlug paths', () => {
    test('throws AppError.notFound when article does not exist', async () => {
      (prisma.article as any).findUnique = async () => null;

      await assert.rejects(
        () => ArticleService.getArticleBySlug('nonexistent-slug'),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 404);
          assert.equal(err.errorCode, 'ARTICLE_NOT_FOUND');
          return true;
        }
      );
    });

    test('throws AppError.forbidden when draft article is requested by non-author', async () => {
      (prisma.article as any).findUnique = async () => ({
        id: 'art-draft',
        slug: 'draft-article',
        published: false,
        authorId: 'author-user-id',
        reactions: [],
      });

      await assert.rejects(
        () => ArticleService.getArticleBySlug('draft-article', 'different-user-id'),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 403);
          assert.equal(err.errorCode, 'FORBIDDEN');
          return true;
        }
      );
    });

    test('returns draft article successfully when accessed by its author', async () => {
      (prisma.article as any).findUnique = async () => ({
        id: 'art-draft',
        slug: 'draft-article',
        published: false,
        authorId: 'author-user-id',
        reactions: [{ type: 'LIKE', userId: 'author-user-id' }],
      });
      (prisma.article as any).update = async () => ({});
      (prisma.bookmark as any).findUnique = async () => null;

      const result = await ArticleService.getArticleBySlug('draft-article', 'author-user-id');
      assert.equal(result.id, 'art-draft');
      assert.equal(result.userReactions.liked, true);
      assert.equal(result.userBookmarked, false);
    });
  });

  describe('reactArticle toggle logic', () => {
    test('adds reaction and triggers notification when user has not reacted yet', async () => {
      (prisma.article as any).findUnique = async () => ({
        id: 'art-1',
        authorId: 'author-id-123',
        slug: 'barruu-tokkoffaa',
      });
      (prisma.reaction as any).findUnique = async () => null;
      (prisma.reaction as any).create = async (args: any) => ({
        id: 'reaction-1',
        ...args.data,
      });

      let notified = false;
      NotificationService.createNotification = (async (data: any) => {
        notified = true;
        assert.equal(data.userId, 'author-id-123');
        assert.equal(data.actorId, 'actor-user-id');
        assert.equal(data.type, 'LIKE');
      }) as any;

      const res = await ArticleService.reactArticle('art-1', 'actor-user-id', 'LIKE');
      assert.equal(res.action, 'ADDED');
      assert.equal(notified, true);
    });

    test('removes reaction when existing reaction is found (toggle off)', async () => {
      (prisma.article as any).findUnique = async () => ({
        id: 'art-1',
        authorId: 'author-id-123',
        slug: 'barruu-tokkoffaa',
      });
      (prisma.reaction as any).findUnique = async () => ({
        id: 'reaction-1',
        userId: 'actor-user-id',
        articleId: 'art-1',
        type: 'LIKE',
      });
      (prisma.reaction as any).delete = async () => ({ id: 'reaction-1' });

      const res = await ArticleService.reactArticle('art-1', 'actor-user-id', 'LIKE');
      assert.equal(res.action, 'REMOVED');
      assert.equal(res.type, 'LIKE');
    });

    test('throws AppError.notFound when reacting to non-existent article', async () => {
      (prisma.article as any).findUnique = async () => null;

      await assert.rejects(
        () => ArticleService.reactArticle('invalid-id', 'user-1', 'LIKE'),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 404);
          return true;
        }
      );
    });
  });

  describe('createArticle and updateArticle logic', () => {
    test('createArticle generates unique slug and saves article', async () => {
      let callCount = 0;
      (prisma.article as any).findUnique = async () => {
        callCount++;
        return callCount === 1 ? { id: 'existing' } : null; // collision on first check
      };
      (prisma.article as any).create = async (args: any) => ({
        id: 'new-art-id',
        ...args.data,
      });

      const result = await ArticleService.createArticle(
        {
          title: 'Walaloo Bareedduu',
          content: 'Kun qabiyyee walaloo afaan oromooti kan bareedaa.',
          category: 'WALALOO',
          published: true,
        },
        'user-author-1'
      );

      assert.equal(result.id, 'new-art-id');
      assert.equal(result.slug, 'walaloo-bareedduu-1');
      assert.equal(result.category, 'WALALOO');
    });

    test('updateArticle throws unauthorized when non-author attempts edit', async () => {
      (prisma.article as any).findUnique = async () => ({
        id: 'art-1',
        authorId: 'author-1',
        slug: 'walaloo',
      });

      await assert.rejects(
        () =>
          ArticleService.updateArticle(
            { title: 'New Title' },
            'different-user-id',
            'art-1'
          ),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 401);
          assert.equal(err.errorCode, 'UNAUTHORIZED');
          return true;
        }
      );
    });

    test('deleteArticle throws unauthorized when non-author attempts deletion', async () => {
      (prisma.article as any).findUnique = async () => ({
        id: 'art-1',
        authorId: 'author-1',
      });

      await assert.rejects(
        () => ArticleService.deleteArticle('art-1', 'impostor-id'),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 401);
          return true;
        }
      );
    });
  });

  describe('commentArticle validation & creation', () => {
    test('throws badRequest when comment content is empty or blank', async () => {
      await assert.rejects(
        () => ArticleService.commentArticle('art-1', 'user-1', '   '),
        (err: any) => {
          assert(err instanceof AppError);
          assert.equal(err.statusCode, 400);
          assert.equal(err.errorCode, 'INVALID_COMMENT_CONTENT');
          return true;
        }
      );
    });
  });
});
