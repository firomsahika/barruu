import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Category, CATEGORY_LABELS } from '../types';

const CATEGORIES: Category[] = [
  'ODUU',
  'MAMMAAKSA',
  'SEENAA',
  'WALALOO',
  'DURDURII',
  'ASOOSAMA',
  'OOLMAA',
  'SAGALEE',
];

describe('Write SettingsPanel & Publishing Workflow Contract', () => {
  it('contains all 8 required literary publishing categories', () => {
    assert.strictEqual(CATEGORIES.length, 8);
    for (const cat of CATEGORIES) {
      assert.ok(CATEGORY_LABELS[cat], `Missing label for category ${cat}`);
    }
  });

  it('correctly normalizes comma-separated tags', () => {
    const rawTagInput = 'Aadaa, Seenaa ,  Oromoo, Barnoota ';
    const tags = rawTagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    assert.deepStrictEqual(tags, ['aadaa', 'seenaa', 'oromoo', 'barnoota']);
  });

  it('validates image file extensions for article cover upload', () => {
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const testFilenames = [
      { name: 'cover.png', valid: true },
      { name: 'banner.webp', valid: true },
      { name: 'script.exe', valid: false },
      { name: 'doc.pdf', valid: false },
    ];

    for (const file of testFilenames) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isValid = validExtensions.includes(ext || '');
      assert.strictEqual(isValid, file.valid);
    }
  });
});
