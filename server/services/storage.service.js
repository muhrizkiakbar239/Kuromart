import { randomUUID } from 'node:crypto';
import { adminClient } from '../config/supabase.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/response.js';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function uploadProductImage(dataUrl, ownerId) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!match) throw new HttpError(422, 'Format gambar harus JPG, PNG, atau WEBP.');

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > env.maxImageBytes) throw new HttpError(422, 'Ukuran gambar maksimal 2 MB.');

  const path = `${ownerId}/${randomUUID()}.${TYPES[match[1]]}`;
  const bucket = adminClient().storage.from(env.productBucket);
  const { error } = await bucket.upload(path, buffer, { contentType: match[1], upsert: false });
  if (error) throw error;

  return bucket.getPublicUrl(path).data.publicUrl;
}
