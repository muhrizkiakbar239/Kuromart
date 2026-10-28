import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { requireLogin } from '../core/auth.js';
import { wishlistItems, removeFromWishlist } from '../core/api.js';
import { rupiah, esc, productArt, toast } from '../core/utils.js';

renderHeader('wishlist');
renderFooter();

const $grid = document.getElementById('wish-grid');
if (requireLogin()) load();

function render(items) {
  if (!items.length) {
    $grid.innerHTML = `<div class="empty-state"><h3>Belum ada favorit</h3><p>Simpan produk yang kamu suka agar mudah ditemukan lagi.</p><a class="btn btn-primary" href="/pages/products.html">Jelajahi katalog</a></div>`;
    return;
  }
  $grid.innerHTML = items.map((p) => `
    <article class="product-card">
      <a class="product-media" href="/pages/product-detail.html?slug=${esc(p.slug)}">
        <img loading="lazy" src="${productArt(p)}" alt="${esc(p.name)}">
      </a>
      <div class="product-body">
        <p class="product-store">${esc(p.store)}</p>
        <h3 class="product-name"><a href="/pages/product-detail.html?slug=${esc(p.slug)}">${esc(p.name)}</a></h3>
        <div class="price-row"><strong>${rupiah(p.price)}</strong></div>
        <button class="btn btn-ghost btn-small" type="button" data-remove="${esc(p.id)}">Hapus dari favorit</button>
      </div>
    </article>`).join('');
}

async function load() {
  render(await wishlistItems());
}

$grid.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  await removeFromWishlist(button.dataset.remove);
  toast('Dihapus dari favorit');
  await load();
});
