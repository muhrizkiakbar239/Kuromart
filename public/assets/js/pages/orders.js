import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { requireLogin } from '../core/auth.js';
import { myOrders } from '../core/api.js';
import { rupiah, esc } from '../core/utils.js';
import { STATUS_LABEL, dateTime } from '../core/format.js';

renderHeader('orders');
renderFooter();

if (requireLogin()) load();

async function load() {
  const list = document.getElementById('orders-list');
  try {
    const orders = await myOrders();
    if (!orders.length) {
      list.innerHTML = `<div class="empty-state"><h3>Belum ada pesanan</h3><p>Pesanan yang kamu buat akan muncul di sini.</p><a class="btn btn-primary" href="/pages/products.html">Mulai belanja</a></div>`;
      return;
    }
    list.innerHTML = orders.map((o) => `
      <a class="order-row" href="/pages/order-detail.html?id=${esc(o.id)}">
        <div>
          <strong>${esc(o.code)}</strong>
          <span class="muted">${dateTime(o.createdAt)} · ${o.items.length} produk</span>
        </div>
        <span class="status status-${o.status}">${STATUS_LABEL[o.status]}</span>
        <strong>${rupiah(o.total)}</strong>
      </a>`).join('');
  } catch (err) {
    list.innerHTML = `<p class="form-error">${esc(err.message)}</p>`;
  }
}
