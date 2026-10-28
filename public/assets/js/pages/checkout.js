import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { getCart, clearCart } from '../core/cart.js';
import { getProductById, checkout, checkVoucher } from '../core/api.js';
import { requireLogin } from '../core/auth.js';
import { rupiah, esc, productArt, toast } from '../core/utils.js';

renderHeader('cart');
renderFooter();

const user = requireLogin();
if (user) init();

const SHIPPING_FREE_FROM = 500000;
const SHIPPING_FEE = 15000;

let appliedVoucher = null;
let lines = [];

async function init() {
  const raw = getCart();
  if (!raw.length) {
    document.getElementById('checkout-body').innerHTML = `<div class="empty-state"><h3>Keranjang kosong</h3><a class="btn btn-primary" href="/pages/products.html">Mulai belanja</a></div>`;
    return;
  }

  lines = (await Promise.all(raw.map(async (item) => {
    const product = await getProductById(item.id);
    return product ? { ...item, product } : null;
  }))).filter(Boolean);

  document.getElementById('summary-items').innerHTML = lines.map((l) => `
    <div class="sum-item">
      <img src="${productArt(l.product)}" alt="">
      <div><strong>${esc(l.product.name)}</strong><span class="muted">${l.qty} x ${rupiah(l.product.price)}${l.variant ? ` · ${esc(l.variant)}` : ''}</span></div>
      <span>${rupiah(l.product.price * l.qty)}</span>
    </div>`).join('');

  render();
  bindForm();
}

function totals() {
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const discount = appliedVoucher ? Math.min(appliedVoucher.discount, subtotal) : 0;
  const shipping = subtotal >= SHIPPING_FREE_FROM ? 0 : SHIPPING_FEE;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

function render() {
  const t = totals();
  document.getElementById('t-subtotal').textContent = rupiah(t.subtotal);
  document.getElementById('t-discount').textContent = t.discount ? `-${rupiah(t.discount)}` : rupiah(0);
  document.getElementById('t-shipping').textContent = t.shipping ? rupiah(t.shipping) : 'Gratis';
  document.getElementById('t-total').textContent = rupiah(t.total);
  document.getElementById('voucher-state').textContent = appliedVoucher
    ? `Voucher ${appliedVoucher.code} diterapkan`
    : '';
}

function bindForm() {
  const form = document.getElementById('checkout-form');
  const voucherInput = document.getElementById('voucher-input');
  const voucherError = document.getElementById('voucher-error');
  const errorEl = document.getElementById('form-error');

  document.getElementById('voucher-apply').addEventListener('click', async () => {
    voucherError.textContent = '';
    const code = voucherInput.value.trim();
    if (!code) {
      appliedVoucher = null;
      render();
      return;
    }
    try {
      appliedVoucher = { code: code.toUpperCase(), ...(await checkVoucher(code, totals().subtotal)) };
      render();
    } catch (err) {
      appliedVoucher = null;
      voucherError.textContent = err.message;
      render();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.textContent = '';
    const button = document.getElementById('pay-btn');
    button.disabled = true;
    try {
      const order = await checkout({
        items: lines.map((l) => ({ productId: l.id, qty: l.qty })),
        address: {
          name: form.name.value,
          phone: form.phone.value,
          street: form.street.value,
          city: form.city.value,
          postalCode: form.postalCode.value
        },
        paymentMethod: form.paymentMethod.value,
        voucherCode: appliedVoucher?.code || null
      });
      clearCart();
      toast('Pesanan berhasil dibuat');
      location.href = `/pages/order-detail.html?id=${order.id}&new=1`;
    } catch (err) {
      errorEl.textContent = err.message;
      button.disabled = false;
    }
  });
}
