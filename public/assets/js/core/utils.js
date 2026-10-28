import { CONFIG } from './config.js';

export const $ = (selector, root = document) => root.querySelector(selector);

export const params = () => new URLSearchParams(window.location.search);

export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

export const rupiah = (value) =>
  new Intl.NumberFormat(CONFIG.locale, {
    style: 'currency',
    currency: CONFIG.currency,
    maximumFractionDigits: 0
  }).format(value);

export const discountPercent = (price, compareAt) =>
  compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0;

// Gambar produk dari server jika ada, jika tidak gunakan ilustrasi SVG cadangan.
export function productArt(product) {
  if (product.imageUrl) return product.imageUrl;
  const [from, to] = product.colors || ['#1F1F26', '#6D28D9'];
  const label = esc(product.shortName || String(product.name || '').split(' ')[0].slice(0, 10));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <circle cx="320" cy="80" r="120" fill="#ffffff" fill-opacity=".08"/>
    <circle cx="60" cy="340" r="95" fill="#000000" fill-opacity=".14"/>
    <text x="200" y="218" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="700" fill="#ffffff">${label}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('is-show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('is-show'), 2200);
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.readAsDataURL(file);
  });
}
