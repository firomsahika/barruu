import { describe, it } from 'node:test';
import assert from 'node:assert';

export function calculateReadingTime(content: string, wpm = 100): number {
  const plainText = content.replace(/<[^>]*>/g, ' ').trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wpm));
}

describe('Frontend Reading Time Calculations', () => {
  it('returns 1 minute for short articles', () => {
    const text = 'Afaan Oromoo afaan bal\'aa fi bareedaadha.';
    assert.strictEqual(calculateReadingTime(text), 1);
  });

  it('calculates reading time correctly based on 100 WPM cadence', () => {
    const words = new Array(250).fill('jecha').join(' ');
    assert.strictEqual(calculateReadingTime(words, 100), 3);
  });

  it('handles HTML markup cleanly when estimating reading time', () => {
    const html = '<h1>Mata-duree</h1><p>Barruu kana keessatti seenaa fi aadaa bal\'inaan ilaalla.</p>';
    assert.strictEqual(calculateReadingTime(html), 1);
  });
});
