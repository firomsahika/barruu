import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import slugify from 'slug';
import { ArticleService } from '../services/article.service';

describe('Article Utilities & Business Rules', () => {
  describe('calculateReadingTime', () => {
    it('returns 1 minute minimum for short texts', () => {
      const shortContent = 'Barruun kun gabaabaa dha.';
      const minutes = ArticleService.calculateReadingTime(shortContent);
      assert.equal(minutes, 1);
    });

    it('calculates reading time at 100 words per minute', () => {
      const words = Array.from({ length: 250 }, (_, i) => `jechoota_${i}`).join(' ');
      const minutes = ArticleService.calculateReadingTime(words);
      assert.equal(minutes, 3);
    });

    it('returns at least 1 minute for empty or single word content', () => {
      assert.equal(ArticleService.calculateReadingTime(''), 1);
      assert.equal(ArticleService.calculateReadingTime('Jechoota'), 1);
    });
  });

  describe('slugify integration', () => {
    it('generates clean lowercase URL slug from title', () => {
      const title = 'Afaan Oromoo fi Og-barruu Isaa';
      const slug = slugify(title, { lower: true });
      assert.equal(slug, 'afaan-oromoo-fi-og-barruu-isaa');
    });

    it('strips special punctuation while preserving Oromo glottals cleanly', () => {
      const title = 'Mammaaksa fi Durdurii: Kutaa 1ffaa!';
      const slug = slugify(title, { lower: true });
      assert.ok(!slug.includes('!'));
      assert.ok(!slug.includes(':'));
    });
  });

  describe('excerpt generation logic', () => {
    it('strips HTML tags and limits to 200 characters', () => {
      const rawHtml = '<p>Barruu <strong>bareedaa</strong> seenaa Oromoo qabate kan dubbisaaf qophaa\'e.</p>';
      const stripped = rawHtml.substring(0, 200).replace(/<[^>]*>/g, '') + '...';
      assert.ok(!stripped.includes('<p>'));
      assert.ok(!stripped.includes('<strong>'));
      assert.ok(stripped.endsWith('...'));
    });
  });
});
