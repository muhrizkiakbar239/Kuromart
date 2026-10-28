import { randomBytes } from 'node:crypto';

export function slugify(text) {
  const base = String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';
  return `${base}-${randomBytes(3).toString('hex')}`;
}
