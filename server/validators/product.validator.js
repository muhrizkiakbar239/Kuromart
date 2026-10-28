import { HttpError } from '../utils/response.js';

const STATUSES = ['active', 'draft', 'archived'];

// partial = true untuk PATCH: field yang tidak dikirim dilewati.
export function validateProduct(body = {}, partial = false) {
  const errors = [];
  const out = {};

  const pick = (key, check, required = false) => {
    if (body[key] === undefined) {
      if (required && !partial) errors.push(`${key} wajib diisi.`);
      return;
    }
    const result = check(body[key]);
    if (result.error) errors.push(result.error);
    else out[key] = result.value;
  };

  pick('name', (v) => {
    const name = typeof v === 'string' ? v.trim() : '';
    return name.length >= 3 && name.length <= 120
      ? { value: name }
      : { error: 'Nama produk harus 3 sampai 120 karakter.' };
  }, true);

  pick('categoryId', (v) => (Number.isInteger(v) && v > 0 ? { value: v } : { error: 'Kategori tidak valid.' }), true);

  pick('description', (v) => (typeof v === 'string' && v.length <= 5000
    ? { value: v }
    : { error: 'Deskripsi maksimal 5000 karakter.' }));

  pick('price', (v) => (Number.isInteger(v) && v >= 100
    ? { value: v }
    : { error: 'Harga minimal Rp100 dan harus bilangan bulat.' }), true);

  pick('compareAt', (v) => (v === null || (Number.isInteger(v) && v >= 0)
    ? { value: v }
    : { error: 'Harga coret tidak valid.' }));

  pick('stock', (v) => (Number.isInteger(v) && v >= 0 ? { value: v } : { error: 'Stok tidak valid.' }), true);

  pick('status', (v) => (STATUSES.includes(v) ? { value: v } : { error: 'Status produk tidak valid.' }));

  if (errors.length) throw new HttpError(422, errors[0]);
  return out;
}
