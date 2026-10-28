import { HttpError } from '../utils/response.js';
import { slugify } from '../utils/slug.js';
import * as repo from '../repositories/products.repository.js';
import * as storesRepo from '../repositories/stores.repository.js';
import { uploadProductImage } from './storage.service.js';

const COLUMN = {
  name: 'name',
  categoryId: 'category_id',
  description: 'description',
  price: 'price',
  compareAt: 'compare_at',
  stock: 'stock',
  status: 'status'
};

function toRow(body) {
  return Object.fromEntries(Object.entries(body).map(([key, value]) => [COLUMN[key], value]));
}

// Katalog publik
export async function listCatalog(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(query.limit, 10) || 8));
  const from = (page - 1) * limit;

  let categoryId;
  if (query.category) {
    categoryId = await repo.findCategoryIdBySlug(query.category);
    if (!categoryId) return { items: [], total: 0, page, pages: 1 };
  }

  const { rows, total } = await repo.findPublished({
    categoryId,
    q: query.q,
    sort: query.sort,
    from,
    to: from + limit - 1
  });
  return { items: rows, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getPublishedBySlug(slug) {
  const product = await repo.findPublishedBySlug(slug);
  if (!product) throw new HttpError(404, 'Produk tidak ditemukan.');
  return product;
}

export async function getPublishedById(id) {
  const product = await repo.findPublishedById(id);
  if (!product) throw new HttpError(404, 'Produk tidak ditemukan.');
  return product;
}

export async function listCategories() {
  return repo.listCategories();
}

// Seller
async function requireActiveStore(user) {
  const store = await storesRepo.findByOwner(user.id);
  if (!store) throw new HttpError(403, 'Anda belum memiliki toko. Ajukan toko terlebih dahulu.');
  if (store.status !== 'active') throw new HttpError(403, 'Toko Anda belum disetujui.');
  return store;
}

async function requireOwnedProduct(user, id) {
  const store = await requireActiveStore(user);
  const product = await repo.findById(id);
  if (!product || product.storeId !== store.id) throw new HttpError(404, 'Produk tidak ditemukan.');
  return product;
}

export async function listSellerProducts(user) {
  const store = await requireActiveStore(user);
  return repo.listByStore(store.id);
}

export async function getSellerProduct(user, id) {
  return requireOwnedProduct(user, id);
}

export async function createProduct(user, body, imageDataUrl) {
  const store = await requireActiveStore(user);
  const imageUrl = imageDataUrl ? await uploadProductImage(imageDataUrl, user.id) : null;
  const id = await repo.insert({
    store_id: store.id,
    slug: slugify(body.name),
    description: '',
    compare_at: null,
    status: 'active',
    image_url: imageUrl,
    ...toRow(body)
  });
  return repo.findById(id);
}

export async function updateProduct(user, id, body, imageDataUrl) {
  await requireOwnedProduct(user, id);
  const row = toRow(body);
  if (imageDataUrl) row.image_url = await uploadProductImage(imageDataUrl, user.id);
  await repo.update(id, row);
  return repo.findById(id);
}

export async function archiveProduct(user, id) {
  await requireOwnedProduct(user, id);
  await repo.update(id, { status: 'archived' });
  return { id, status: 'archived' };
}
