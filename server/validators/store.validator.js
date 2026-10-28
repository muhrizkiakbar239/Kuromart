import { HttpError } from '../utils/response.js';

export function validateStore(body = {}) {
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  if (name.length < 3 || name.length > 80) throw new HttpError(422, 'Nama toko harus 3 sampai 80 karakter.');
  if (description.length > 500) throw new HttpError(422, 'Deskripsi toko maksimal 500 karakter.');
  return { name, description };
}
