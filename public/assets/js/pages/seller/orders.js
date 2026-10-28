import { renderHeader } from '../../components/header.js';
import { renderFooter } from '../../components/footer.js';
import { requireLogin } from '../../core/auth.js';
import { sellerOrders, sellerShipOrder } from '../../core/api.js';
import { rupiah, esc, toast } from '../../core/utils.js';
import { STATUS_LABEL, dateTime } from '../../core/format.js';

renderHeader('seller');
renderFooter();

const user = requireLogin();
if (user) init(user);

const $list = document.getElementById('orders-list');

async function init(user) {
  if (user.role !== 'seller') {
    location.replace('/pages/seller/apply.html');
    return;
  }
  await load();
}

async function load() {
  try {
    const orders = await sellerOrders();
    if (!orders.length) {
      $list.innerHTML = `<div class="empty-state"><h3>Belum ada pesanan</h3><p>Pesanan untuk produk tokomu akan muncul di sini.</p></div>`;
      return;
    }
    $list.innerHTML = orders.map((o) => `
      <article class="seller-order">
        <div class="seller-order-head">
          <div>
            <strong>${esc(o.code)}</strong>
            <span class="muted">${dateTime(o.createdAt)}</span>
          </div>
          <span class="status status-${o.status}">${STATUS_LABEL[o.status]}</span>
        </div>
        <ul class="order-lines">
          ${o.items.map((i) => `<li><span>${esc(i.name)} x${i.qty}</span><span>${rupiah(i.subtotal)}</span></li>`).join('')}
        </ul>
        <div class="seller-order-foot">
          <span>Penerima: <strong>${esc(o.address.name)}</strong>, ${esc(o.address.city)}</span>
          <div class="seller-order-total">
            <strong>${rupiah(o.storeTotal)}</strong>
            ${o.status === 'processing' ? `<button class="btn btn-primary btn-small" type="button" data-ship="${esc(o.id)}">Tandai dikirim</button>` : ''}
          </div>
        </div>
      </article>`).join('');
  } catch (err) {
    $list.innerHTML = `<p class="form-error">${esc(err.message)}</p>`;
  }
}

$list.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-ship]');
  if (!button) return;
  try {
    const courier = window.prompt('Nama kurir (contoh: JNE, J&T, SiCepat)', '');
    if (courier === null) return;
    const trackingNumber = window.prompt('Nomor resi', '') ?? '';
    await sellerShipOrder(button.dataset.ship, { courier, trackingNumber });
    toast('Pesanan ditandai dikirim');
    await load();
  } catch (err) {
    toast(err.message);
  }
});
