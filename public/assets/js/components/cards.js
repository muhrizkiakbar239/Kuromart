import { icons } from '../core/icons.js';
import { esc, rupiah, productArt, discountPercent, toast } from '../core/utils.js';
import { addItem } from '../core/cart.js';
import { getProductById } from '../core/api.js';

export function productCard(p) {
  const off = discountPercent(p.price, p.compareAt);
  return `
    <article class="product-card">
      <a class="product-media" href="/pages/product-detail.html?slug=${esc(p.slug)}">
        <img loading="lazy" src="${productArt(p)}" alt="${esc(p.name)}">
        ${p.badge ? `<span class="tag">${esc(p.badge)}</span>` : ''}
        ${off ? `<span class="tag tag-off">-${off}%</span>` : ''}
      </a>
      <div class="product-body">
        <p class="product-store">${esc(p.store)}</p>
        <h3 class="product-name"><a href="/pages/product-detail.html?slug=${esc(p.slug)}">${esc(p.name)}</a></h3>
        <div class="rating">${icons.star}<span>${p.rating.toFixed(1)}</span><span class="muted">${p.sold.toLocaleString('id-ID')} terjual</span></div>
        <div class="price-row">
          <strong>${rupiah(p.price)}</strong>
          ${p.compareAt ? `<s>${rupiah(p.compareAt)}</s>` : ''}
        </div>
        <button class="btn btn-primary btn-small" type="button" data-add="${p.id}" ${p.variants.length ? 'data-has-variant' : ''}>
          ${p.variants.length ? 'Pilih ukuran' : 'Tambah'}
        </button>
      </div>
    </article>`;
}

export function categoryTile(c) {
  return `
    <a class="category-tile" href="/pages/products.html?category=${esc(c.slug)}">
      <span class="category-dot" style="background:${c.color}"></span>
      <span class="category-name">${esc(c.name)}</span>
      <span class="muted">Lihat produk</span>
    </a>`;
}

// Satu listener untuk seluruh grid, aman dipakai walau isi grid berubah.
export function bindQuickAdd(root) {
  root.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-add]');
    if (!button) return;
    if (button.hasAttribute('data-has-variant')) {
      window.location.href = `/pages/product-detail.html?id=${button.dataset.add}`;
      return;
    }
    const product = await getProductById(button.dataset.add);
    if (!product) return;
    addItem(product);
    toast(`${product.name} ditambahkan ke keranjang`);
  });
}
