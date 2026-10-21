import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index';
import { prisma } from '../lib/prisma';

const secret: string = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';

describe('Article Controller & Routes API Tests', () => {
  const validToken = jwt.sign(
    { id: 'test-user-1', email: 'test@barruu.com', role: 'USER' },
    secret
  );

  const originalArticleFindMany = prisma.article.findMany;
  const originalArticleCount = prisma.article.count;
  const originalArticleFindUnique = prisma.article.findUnique;
  const originalReactionFindUnique = prisma.reaction.findUnique;
  const originalReactionCreate = prisma.reaction.create;
  const originalReactionDelete = prisma.reaction.delete;
  const originalNotificationCreate = prisma.notification.create;

  afterEach(() => {
    (prisma.article as any).findMany = originalArticleFindMany;
    (prisma.article as any).count = originalArticleCount;
    (prisma.article as any).findUnique = originalArticleFindUnique;
    (prisma.reaction as any).findUnique = originalReactionFindUnique;
    (prisma.reaction as any).create = originalReactionCreate;
    (prisma.reaction as any).delete = originalReactionDelete;
    (prisma.notification as any).create = originalNotificationCreate;
  });

  describe('GET /api/articles', () => {
    test('returns 200 and list of published articles', async () => {
      (prisma.article as any).findMany = async () => [
        {
          id: 'art-1',
          title: 'Asoosama Bareedaa',
          slug: 'asoosama-bareedaa',
          published: true,
          reactions: [{ type: 'LIKE' }],
          comments: [],
          author: { id: 'u1', name: 'Caalaa', username: 'caalaa', avatarUrl: null },
          tags: [],
          _count: { reactions: 1, comments: 0, bookmarks: 0 },
        },
      ];
      (prisma.article as any).count = async () => 1;

      const res = await request(app).get('/api/articles?page=1&limit=10');
      assert.equal(res.status, 200);
      assert(Array.isArray(res.body.articles));
      assert.equal(res.body.articles.length, 1);
      assert.equal(res.body.articles[0].title, 'Asoosama Bareedaa');
      assert.equal(res.body.pagination.total, 1);
    });
  });

  describe('GET /api/articles/:slug', () => {
    test('returns 404 when article does not exist', async () => {
      (prisma.article as any).findUnique = async () => null;

      const res = await request(app).get('/api/articles/non-existent-slug');
      assert.equal(res.status, 404);
      assert(res.body.error);
    });
  });

  describe('POST /api/articles/:id/react', () => {
    test('returns 401 when authorization header is missing', async () => {
      const res = await request(app)
        .post('/api/articles/art-1/react')
        .send({ type: 'LIKE' });

      assert.equal(res.status, 401);
      assert(res.body.error);
    });

    test('returns 404 when article does not exist', async () => {
      (prisma.article as any).findUnique = async () => null;

      const res = await request(app)
        .post('/api/articles/nonexistent-art/react')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ type: 'LIKE' });

      assert.equal(res.status, 404);
      assert.equal(res.body.error, 'Barruu hin argamne');
    });

    test('returns 200 and creates reaction when user has not reacted yet', async () => {
      (prisma.article as any).findUnique = async () => ({
        id: 'art-1',
        title: 'Seenaa Oromoo',
        slug: 'seenaa-oromoo',
        authorId: 'author-1',
      });

      (prisma.reaction as any).findUnique = async () => null;
      (prisma.reaction as any).create = async (args: any) => ({
        id: 'rx-1',
        ...args.data,
      });
      (prisma.notification as any).create = async (args: any) => ({
        id: 'notif-1',
        ...args.data,
      });

      const res = await request(app)
        .post('/api/articles/art-1/react')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ type: 'LIKE' });

      assert.equal(res.status, 200);
      assert.equal(res.body.reacted, true);
      assert.equal(res.body.type, 'LIKE');
    });

    test('returns 200 and removes reaction when user toggles reaction off', async () => {
      (prisma.article as any).findUnique = async () => ({
        id: 'art-1',
        title: 'Seenaa Oromoo',
        slug: 'seenaa-oromoo',
        authorId: 'author-1',
      });

      (prisma.reaction as any).findUnique = async () => ({
        id: 'rx-1',
        userId: 'test-user-1',
        articleId: 'art-1',
        type: 'LIKE',
      });

      (prisma.reaction as any).delete = async () => ({ id: 'rx-1' });

      const res = await request(app)
        .post('/api/articles/art-1/react')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ type: 'LIKE' });

      assert.equal(res.status, 200);
      assert.equal(res.body.reacted, false);
      assert.equal(res.body.type, 'LIKE');
    });
  });
});
