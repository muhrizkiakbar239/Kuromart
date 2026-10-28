import { productReviews } from '../core/api.js';
import { esc } from '../core/utils.js';
import { dateTime } from '../core/format.js';
import { icons } from '../core/icons.js';

// Dipanggil dari product-detail.js setelah produk dimuat.
export async function renderReviews(productId) {
  const el = document.getElementById('reviews');
  if (!el) return;
  const reviews = await productReviews(productId);
  if (!reviews.length) {
    el.innerHTML = `<h2>Ulasan</h2><p class="muted">Belum ada ulasan untuk produk ini.</p>`;
    return;
  }
  el.innerHTML = `<h2>Ulasan</h2>` + reviews.map((r) => `
    <article class="review">
      <div class="rating">${Array.from({ length: r.rating }, () => icons.star).join('')}<span class="muted">${esc(r.author)}</span></div>
      <p>${esc(r.comment)}</p>
      <span class="muted">${dateTime(r.createdAt)}</span>
    </article>`).join('');
}
