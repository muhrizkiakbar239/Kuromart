import { HttpError } from '../utils/response.js';
import { slugify } from '../utils/slug.js';
import * as storesRepo from '../repositories/stores.repository.js';
import * as usersRepo from '../repositories/users.repository.js';

const mapStore = (s) => s && ({
  id: s.id,
  name: s.name,
  slug: s.slug,
  description: s.description,
  status: s.status,
  ownerId: s.owner_id,
  createdAt: s.created_at
});

export async function applyStore(user, { name, description }) {
  if (await storesRepo.findByOwner(user.id)) throw new HttpError(409, 'Anda sudah memiliki toko.');
  const store = await storesRepo.create({
    owner_id: user.id,
    name,
    slug: slugify(name),
    description,
    status: 'pending'
  });
  return mapStore(store);
}

export async function getMyStore(user) {
  return mapStore(await storesRepo.findByOwner(user.id));
}

export async function listPending() {
  return (await storesRepo.listByStatus('pending')).map(mapStore);
}

export async function approveStore(storeId) {
  const store = await storesRepo.findById(storeId);
  if (!store) throw new HttpError(404, 'Toko tidak ditemukan.');
  const updated = await storesRepo.setStatus(storeId, 'active');
  await usersRepo.setRole(store.owner_id, 'seller');
  return mapStore(updated);
}
