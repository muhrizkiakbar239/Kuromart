import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../server/utils/slug.js';
import { parsePagination } from '../../server/utils/pagination.js';

test('slugify membuat slug aman dan unik', () => {
  const a = slugify('Kemeja Linen Premium!');
  const b = slugify('Kemeja Linen Premium!');
  assert.match(a, /^kemeja-linen-premium-[0-9a-f]{6}$/);
  assert.notEqual(a, b);
});

test('slugify menangani judul kosong dengan nilai cadangan', () => {
  assert.match(slugify('!!!'), /^item-[0-9a-f]{6}$/);
});

test('pagination membatasi limit maksimal 48', () => {
  const p = parsePagination({ page: '2', limit: '500' });
  assert.equal(p.limit, 48);
  assert.equal(p.from, 48);
  assert.equal(p.to, 95);
});

test('pagination memakai nilai default saat query kosong', () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 8, from: 0, to: 7 });
});
