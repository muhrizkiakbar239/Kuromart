import { CONFIG } from './config.js';

const EVENT = 'kuromart:cart';

function read() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.cartStorageKey)) || [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(CONFIG.cartStorageKey, JSON.stringify(items));
  } catch {
    // penyimpanan tidak tersedia (mode privat); keranjang tetap berjalan di sesi ini
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export const getCart = () => read();

export const getCount = () => read().reduce((sum, item) => sum + item.qty, 0);

export function addItem(product, { qty = 1, variant = '' } = {}) {
  const items = read();
  const key = `${product.id}:${variant}`;
  const found = items.find((item) => item.key === key);
  if (found) {
    found.qty = Math.min(99, found.qty + qty);
  } else {
    items.push({ key, id: product.id, variant, qty: Math.min(99, qty) });
  }
  write(items);
}

export function setQty(key, qty) {
  const items = read()
    .map((item) => (item.key === key ? { ...item, qty: Math.min(99, Math.max(1, qty)) } : item));
  write(items);
}

export function removeItem(key) {
  write(read().filter((item) => item.key !== key));
}

export function clearCart() {
  write([]);
}

export function onCartChange(handler) {
  window.addEventListener(EVENT, handler);
}
