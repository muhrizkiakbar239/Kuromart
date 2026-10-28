import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { icons } from '../core/icons.js';
import { getCart, setQty, removeItem, onCartChange } from '../core/cart.js';
import { getProductById } from '../core/api.js';
import { rupiah, esc, productArt, toast } from '../core/utils.js';

renderHeader('cart');
renderFooter();

const $items = document.getElementById('cart-items');
const $summary = document.getElementById('cart-summary');

async function render() {
  const raw = getCart();
  if (!raw.length) {
    $items.innerHTML = `
      <div class="empty-state">
        <h3>Keranjangmu masih kosong</h3>
        <p>Temukan produk favoritmu di katalog.</p>
        <a class="btn btn-primary" href="/pages/products.html">Mulai belanja</a>
      </div>`;
    $summary.hidden = true;
    return;
  }

  const lines = (await Promise.all(raw.map(async (item) => {
    const product = await getProductById(item.id);
    return product ? { ...item, product } : null;
  }))).filter(Boolean);

  $items.innerHTML = lines.map(({ key, qty, variant, product }) => `
    <article class="cart-line" data-key="${esc(key)}">
      <img src="${productArt(product)}" alt="${esc(product.name)}">
      <div class="cart-info">
        <p class="product-store">${esc(product.store)}</p>
        <h3>${esc(product.name)}</h3>
        ${variant ? `<p class="muted">Ukuran ${esc(variant)}</p>` : ''}
        <strong>${rupiah(product.price)}</strong>
      </div>
      <div class="cart-actions">
        <div class="qty" role="group" aria-label="Jumlah">
          <button type="button" data-step="-1" aria-label="Kurangi">${icons.minus}</button>
          <span>${qty}</span>
          <button type="button" data-step="1" aria-label="Tambah">${icons.plus}</button>
        </div>
        <button class="icon-btn-plain" type="button" data-remove aria-label="Hapus">${icons.trash}<span>Hapus</span></button>
      </div>
    </article>`).join('');

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  document.getElementById('sum-count').textContent = `${count} barang`;
  document.getElementById('sum-subtotal').textContent = rupiah(subtotal);
  document.getElementById('sum-total').textContent = rupiah(subtotal);
  $summary.hidden = false;
}

$items.addEventListener('click', (e) => {
  const line = e.target.closest('.cart-line');
  if (!line) return;
  const key = line.dataset.key;
  const step = e.target.closest('[data-step]');
  if (step) {
    const current = getCart().find((i) => i.key === key);
    setQty(key, current.qty + Number(step.dataset.step));
  }
  if (e.target.closest('[data-remove]')) {
    removeItem(key);
    toast('Produk dihapus dari keranjang');
  }
});

// Tombol checkout berupa tautan ke halaman checkout.

onCartChange(render);
render();
