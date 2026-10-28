import { getSession } from './auth.js';

const BASE = '/api';

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const session = getSession();
    if (!session) {
      const err = new Error('Silakan masuk terlebih dahulu.');
      err.status = 401;
      throw err;
    }
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const err = new Error(json.message || 'Permintaan gagal. Coba lagi.');
    err.status = res.status;
    throw err;
  }
  return json.data;
}

const toQuery = (obj) => {
  const qs = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value);
  });
  return qs.toString();
};

// Katalog publik
export const listCategories = () => request('/categories');

export function listProducts({ perPage, ...rest } = {}) {
  return request(`/products?${toQuery({ ...rest, limit: perPage ?? rest.limit })}`);
}

export async function getFeatured(limit = 8) {
  const result = await listProducts({ sort: 'popular', limit });
  return result.items;
}

export const getProductBySlug = (slug) => request(`/products/${encodeURIComponent(slug)}`).catch(() => null);
export const getProductById = (id) => request(`/products/id/${encodeURIComponent(id)}`).catch(() => null);

// Autentikasi
export const login = (payload) => request('/auth/login', { method: 'POST', body: payload });
export const register = (payload) => request('/auth/register', { method: 'POST', body: payload });

// Seller
export const sellerListProducts = () => request('/seller/products', { auth: true });
export const sellerGetProduct = (id) => request(`/seller/products/${encodeURIComponent(id)}`, { auth: true });
export const sellerCreateProduct = (body) => request('/seller/products', { method: 'POST', body, auth: true });
export const sellerUpdateProduct = (id, body) => request(`/seller/products/${encodeURIComponent(id)}`, { method: 'PATCH', body, auth: true });
export const sellerArchiveProduct = (id) => request(`/seller/products/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });

// Toko
export const getMyStore = () => request('/stores/me', { auth: true });
export const applyStore = (body) => request('/stores/apply', { method: 'POST', body, auth: true });

// Pesanan dan pembayaran
export const checkout = (payload) => request('/orders', { method: 'POST', body: payload, auth: true });
export const myOrders = () => request('/orders', { auth: true });
export const myOrder = (id) => request(`/orders/${encodeURIComponent(id)}`, { auth: true });
export const updateOrderStatus = (id, status) => request(`/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status }, auth: true });
export const checkVoucher = (code, subtotal) => request('/vouchers/check', { method: 'POST', body: { code, subtotal }, auth: true });

// Ulasan
export const productReviews = (productId) => request(`/reviews/product/${encodeURIComponent(productId)}`).catch(() => []);
export const createReview = (payload) => request('/reviews', { method: 'POST', body: payload, auth: true });

// Notifikasi
export const myNotifications = () => request('/notifications', { auth: true });
export const markNotificationsRead = () => request('/notifications/read-all', { method: 'PATCH', auth: true });

// Seller: pesanan
export const sellerOrders = () => request('/seller/orders', { auth: true });
export const sellerShipOrder = (id, shipping = {}) => request(`/seller/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status: 'shipped', ...shipping }, auth: true });

// Wishlist
export const wishlistIds = () => request('/wishlist/ids', { auth: true }).catch(() => []);
export const wishlistItems = () => request('/wishlist', { auth: true });
export const addToWishlist = (productId) => request('/wishlist', { method: 'POST', body: { productId }, auth: true });
export const removeFromWishlist = (productId) => request(`/wishlist/${encodeURIComponent(productId)}`, { method: 'DELETE', auth: true });

// Owner
export const ownerStats = () => request('/owner/stats', { auth: true });
export const ownerOrders = () => request('/owner/orders', { auth: true });
export const ownerVouchers = () => request('/owner/vouchers', { auth: true });
export const ownerCreateVoucher = (body) => request('/owner/vouchers', { method: 'POST', body, auth: true });
export const ownerToggleVoucher = (id, active) => request(`/owner/vouchers/${encodeURIComponent(id)}`, { method: 'PATCH', body: { active }, auth: true });
export const ownerPendingStores = () => request('/stores/owner/pending', { auth: true });
export const ownerApproveStore = (id) => request(`/stores/owner/${encodeURIComponent(id)}/approve`, { method: 'PATCH', auth: true });
