import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { requireLogin } from '../core/auth.js';
import { myOrder, updateOrderStatus, createReview } from '../core/api.js';
import { params, rupiah, esc, toast } from '../core/utils.js';
import { STATUS_LABEL, METHOD_LABEL, dateTime } from '../core/format.js';

renderHeader('orders');
renderFooter();

if (requireLogin()) init();

async function init() {
  const id = params().get('id');
  const root = document.getElementById('order-root');
  if (params().get('new') === '1') document.getElementById('new-banner').hidden = false;

  try {
    const order = await myOrder(id);
    render(order, root);
  } catch (err) {
    root.innerHTML = `<div class="empty-state"><h3>${esc(err.message)}</h3><a class="btn btn-primary" href="/pages/orders.html">Kembali ke pesanan</a></div>`;
  }
}

function render(order, root) {
  const a = order.address;
  root.innerHTML = `
    <div class="order-head">
      <div>
        <p class="eyebrow eyebrow-dark">Pesanan</p>
        <h1>${esc(order.code)}</h1>
        <p class="muted">${dateTime(order.createdAt)} · ${METHOD_LABEL[order.paymentMethod]}</p>
      </div>
      <span class="status status-${order.status}">${STATUS_LABEL[order.status]}</span>
    </div>

    <div class="order-grid">
      <section class="panel">
        <h2>Produk</h2>
        ${order.items.map((i) => `
          <div class="order-item">
            <div><strong>${esc(i.name)}</strong><span class="muted">${i.qty} x ${rupiah(i.unitPrice)}</span></div>
            <span>${rupiah(i.subtotal)}</span>
          </div>`).join('')}
        <div class="sum-line"><span>Subtotal</span><span>${rupiah(order.subtotal)}</span></div>
        ${order.discount ? `<div class="sum-line"><span>Voucher ${esc(order.voucherCode || '')}</span><span>-${rupiah(order.discount)}</span></div>` : ''}
        <div class="sum-line"><span>Ongkir</span><span>${order.shippingFee ? rupiah(order.shippingFee) : 'Gratis'}</span></div>
        <div class="sum-line total"><span>Total</span><strong>${rupiah(order.total)}</strong></div>
      </section>

      <section class="panel">
        <h2>Alamat pengiriman</h2>
        <p><strong>${esc(a.name)}</strong> · ${esc(a.phone)}</p>
        <p class="muted">${esc(a.street)}, ${esc(a.city)} ${esc(a.postalCode)}</p>
        ${order.trackingNumber ? `<p class="tracking"><strong>${esc(order.courier || 'Kurir')}</strong> · resi ${esc(order.trackingNumber)}</p>` : ''}
        <div class="order-actions" id="order-actions"></div>
      </section>
    </div>

    <section class="panel" id="review-panel" hidden>
      <h2>Beri ulasan</h2>
      <p class="muted">Bagikan pengalamanmu untuk membantu pembeli lain.</p>
      <div class="review-list" id="review-list"></div>
    </section>`;

  const actions = document.getElementById('order-actions');
  if (order.status === 'processing') {
    actions.innerHTML = `<button class="btn btn-danger btn-small" type="button" data-status="cancelled">Batalkan pesanan</button>`;
  } else if (order.status === 'shipped') {
    actions.innerHTML = `<button class="btn btn-primary btn-small" type="button" data-status="completed">Pesanan sudah diterima</button>`;
  }

  actions.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-status]');
    if (!button) return;
    const next = button.dataset.status;
    if (next === 'cancelled' && !window.confirm('Batalkan pesanan ini?')) return;
    try {
      await updateOrderStatus(order.id, next);
      toast(next === 'completed' ? 'Terima kasih sudah berbelanja' : 'Pesanan dibatalkan');
      location.reload();
    } catch (err) {
      toast(err.message);
    }
  });

  if (order.status === 'completed') {
    const panel = document.getElementById('review-panel');
    panel.hidden = false;
    const list = document.getElementById('review-list');
    list.innerHTML = order.items.map((i) => `
      <form class="review-form" data-product="${esc(i.productId)}">
        <strong>${esc(i.name)}</strong>
        <div class="stars" role="radiogroup" aria-label="Rating">
          ${[1, 2, 3, 4, 5].map((n) => `<label><input type="radio" name="rating-${esc(i.productId)}" value="${n}" ${n === 5 ? 'checked' : ''}><span>${n}</span></label>`).join('')}
        </div>
        <textarea rows="2" maxlength="1000" placeholder="Tulis ulasan (opsional)"></textarea>
        <button class="btn btn-ghost btn-small" type="submit">Kirim ulasan</button>
      </form>`).join('');

    list.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.target;
      const rating = form.querySelector('input[type="radio"]:checked').value;
      try {
        await createReview({ productId: form.dataset.product, rating: Number(rating), comment: form.querySelector('textarea').value });
        toast('Ulasan terkirim');
        form.innerHTML = `<p class="muted">Ulasan kamu sudah terkirim. Terima kasih.</p>`;
      } catch (err) {
        toast(err.message);
      }
    });
  }
}
