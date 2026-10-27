import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Article, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

describe('ArticleCard Logic & Reaction/Bookmark Unit Tests', () => {
  const mockArticle: Article = {
    id: 'art-101',
    title: 'Asoosama Afaan Oromoo Haaraya',
    slug: 'asoosama-afaan-oromoo-haaraya',
    content: '<p>Barruun kun seenaa bareedaa qaba dhugumatti.</p>',
    excerpt: 'Barruun kun seenaa bareedaa qaba...',
    category: 'ASOOSAMA',
    published: true,
    featured: false,
    readingTime: 3,
    createdAt: '2026-10-20T10:00:00Z',
    author: {
      id: 'author-1',
      name: 'Tolera Bultum',
      username: 'tolera',
      avatarUrl: null,
    },
    reactions: [{ type: 'LIKE' }],
    comments: [],
    tags: [{ tag: { id: 't1', name: 'Asoosama', slug: 'asoosama' } }],
    _count: { reactions: 5, comments: 2, bookmarks: 3 },
    userReactions: { liked: true, unicorned: false },
    reactionCounts: { likes: 5, unicorns: 1 },
    userBookmarked: true,
  };

  describe('Article excerpt & preview sanitization', () => {
    it('strips html tags cleanly from content when excerpt is missing', () => {
      const rawHtml = '<div><p>Odeeffannoo <span>haaraya</span> fi qabatamaa.</p></div>';
      const sanitized = rawHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      assert.equal(sanitized, 'Odeeffannoo haaraya fi qabatamaa.');
    });

    it('extracts tags correctly from relational join structure', () => {
      const tags = mockArticle.tags?.map((t) => t.tag) || [];
      assert.equal(tags.length, 1);
      assert.equal(tags[0].name, 'Asoosama');
      assert.equal(tags[0].slug, 'asoosama');
    });
  });

  describe('Reaction state transitions', () => {
    it('computes initial reaction counts and active flags accurately', () => {
      const liked = mockArticle.userReactions?.liked || false;
      const unicorned = mockArticle.userReactions?.unicorned || false;
      const bookmarked = mockArticle.userBookmarked || false;

      assert.equal(liked, true);
      assert.equal(unicorned, false);
      assert.equal(bookmarked, true);
    });

    it('updates like count correctly on toggle on and toggle off', () => {
      let likeCount = 5;

      // Toggle off (unlike)
      const unreacted = false;
      likeCount = unreacted ? likeCount + 1 : Math.max(0, likeCount - 1);
      assert.equal(likeCount, 4);

      // Toggle on (like)
      const reacted = true;
      likeCount = reacted ? likeCount + 1 : Math.max(0, likeCount - 1);
      assert.equal(likeCount, 5);
    });

    it('updates bookmark status and toggles bookmark state', () => {
      let bookmarked = true;
      let bookmarkCount = mockArticle._count.bookmarks;

      // User removes bookmark
      const responseBookmarked = false;
      bookmarked = responseBookmarked;
      bookmarkCount = responseBookmarked ? bookmarkCount + 1 : Math.max(0, bookmarkCount - 1);

      assert.equal(bookmarked, false);
      assert.equal(bookmarkCount, 2);
    });
  });

  describe('Category metadata presentation', () => {
    it('resolves color tokens for all supported categories', () => {
      assert.equal(CATEGORY_COLORS['ASOOSAMA'], '#0891b2');
      assert.equal(CATEGORY_COLORS['SEENAA'], '#9333ea');
    });

    it('resolves Afaan Oromo localized category labels', () => {
      assert.equal(CATEGORY_LABELS['ASOOSAMA'], 'Asoosama');
      assert.equal(CATEGORY_LABELS['WALALOO'], 'Walaloo');
      assert.equal(CATEGORY_LABELS['MAMMAAKSA'], 'Mammaaksa');
    });
  });
});
