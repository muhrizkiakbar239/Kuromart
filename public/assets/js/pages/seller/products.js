import { renderHeader } from '../../components/header.js';
import { renderFooter } from '../../components/footer.js';
import { requireLogin } from '../../core/auth.js';
import { sellerListProducts, sellerArchiveProduct } from '../../core/api.js';
import { rupiah, esc, productArt, toast } from '../../core/utils.js';

renderHeader('seller');
renderFooter();

const $list = document.getElementById('seller-list');
const $message = document.getElementById('page-message');

const user = requireLogin();
if (user) init(user);

function showMessage(text) {
  $message.hidden = false;
  $message.textContent = text;
}

const STATUS_LABEL = { active: 'Aktif', draft: 'Draf', archived: 'Diarsipkan' };

function render(products) {
  if (!products.length) {
    $list.innerHTML = `<div class="empty-state"><h3>Belum ada produk</h3><p>Tambahkan produk pertamamu untuk mulai berjualan.</p><a class="btn btn-primary" href="/pages/seller/product-form.html">Tambah produk</a></div>`;
    return;
  }
  $list.innerHTML = products.map((p) => `
    <article class="seller-row">
      <img src="${productArt(p)}" alt="${esc(p.name)}">
      <div class="seller-info">
        <h3>${esc(p.name)}</h3>
        <p class="muted">Stok ${p.stock} · ${STATUS_LABEL[p.status] || esc(p.status)}</p>
        <strong>${rupiah(p.price)}</strong>
      </div>
      <div class="seller-actions">
        <a class="btn btn-ghost btn-small" href="/pages/seller/product-form.html?id=${esc(p.id)}">Edit</a>
        ${p.status !== 'archived' ? `<button class="btn btn-danger btn-small" type="button" data-archive="${esc(p.id)}">Arsipkan</button>` : ''}
      </div>
    </article>`).join('');
}

async function load() {
  render(await sellerListProducts());
}

async function init(user) {
  if (user.role !== 'seller') {
    location.replace('/pages/seller/apply.html');
    return;
  }
  try {
    await load();
  } catch (err) {
    showMessage(err.message);
  }
}

$list.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-archive]');
  if (!button) return;
  if (!window.confirm('Arsipkan produk ini? Produk tidak akan tampil di katalog.')) return;
  try {
    await sellerArchiveProduct(button.dataset.archive);
    toast('Produk diarsipkan');
    await load();
  } catch (err) {
    showMessage(err.message);
  }
});
