import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAvatarUrl,
  formatDate,
  formatRelativeDate,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type Category,
} from '../types/index.ts';

describe('Frontend Types & Utility Functions', () => {
  describe('getAvatarUrl', () => {
    it('returns custom avatarUrl when present', () => {
      const url = getAvatarUrl({
        name: 'Chala',
        avatarUrl: 'https://cloudinary.com/avatar.png',
      });
      assert.equal(url, 'https://cloudinary.com/avatar.png');
    });

    it('generates DiceBear initials URL fallback using encoded name when avatarUrl is missing', () => {
      const url = getAvatarUrl({ name: 'Chala Gemechu' });
      assert.ok(url.startsWith('https://api.dicebear.com/7.x/initials/svg?seed=Chala%20Gemechu'));
      assert.ok(url.includes('backgroundColor=3b49df'));
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates correctly into English localized string', () => {
      const formatted = formatDate('2026-08-20T12:00:00Z');
      assert.ok(formatted.includes('Aug'));
      assert.ok(formatted.includes('20'));
      assert.ok(formatted.includes('2026'));
    });
  });

  describe('formatRelativeDate', () => {
    it('returns "amma dura" for dates less than 1 minute ago', () => {
      const nowIso = new Date().toISOString();
      assert.equal(formatRelativeDate(nowIso), 'amma dura');
    });

    it('returns minutes ago for dates under an hour', () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      assert.equal(formatRelativeDate(tenMinutesAgo), 'daqiiqaa 10 dura');
    });

    it('returns hours ago for dates under 24 hours', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
      assert.equal(formatRelativeDate(threeHoursAgo), "sa'aatii 3 dura");
    });

    it('returns days ago for dates under 7 days', () => {
      const fourDaysAgo = new Date(Date.now() - 4 * 86400 * 1000).toISOString();
      assert.equal(formatRelativeDate(fourDaysAgo), 'guyyaa 4 dura');
    });

    it('falls back to formatted absolute date for older dates', () => {
      const oldDate = '2025-01-01T12:00:00Z';
      const result = formatRelativeDate(oldDate);
      assert.ok(result.includes('Jan'));
      assert.ok(result.includes('2025'));
    });
  });

  describe('Category mappings', () => {
    const categories: Category[] = [
      'ODUU',
      'MAMMAAKSA',
      'SEENAA',
      'WALALOO',
      'DURDURII',
      'ASOOSAMA',
      'OOLMAA',
      'SAGALEE',
    ];

    it('has human-readable labels for all supported categories', () => {
      for (const cat of categories) {
        assert.ok(CATEGORY_LABELS[cat], `Missing label for category ${cat}`);
      }
    });

    it('has distinctive color palette hex codes for all supported categories', () => {
      for (const cat of categories) {
        assert.ok(CATEGORY_COLORS[cat]?.startsWith('#'), `Missing or invalid color for category ${cat}`);
      }
    });
  });
});
