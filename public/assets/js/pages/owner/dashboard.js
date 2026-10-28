import { renderHeader } from '../../components/header.js';
import { renderFooter } from '../../components/footer.js';
import { requireLogin } from '../../core/auth.js';
import {
  ownerStats, ownerOrders, ownerVouchers, ownerCreateVoucher, ownerToggleVoucher,
  ownerPendingStores, ownerApproveStore
} from '../../core/api.js';
import { rupiah, esc, toast } from '../../core/utils.js';
import { STATUS_LABEL, dateTime } from '../../core/format.js';

renderHeader('owner');
renderFooter();

const user = requireLogin();
if (user) init(user);

async function init(user) {
  if (user.role !== 'owner') {
    location.replace('/index.html');
    return;
  }
  await Promise.all([loadStats(), loadStores(), loadVouchers(), loadOrders()]);
  bindForms();
}

async function loadStats() {
  const s = await ownerStats();
  document.getElementById('stats').innerHTML = [
    ['Pendapatan', rupiah(s.revenue)],
    ['Total pesanan', s.totalOrders],
    ['Sedang diproses', s.processingOrders],
    ['Toko aktif', s.activeStores],
    ['Menunggu persetujuan', s.pendingStores],
    ['Produk aktif', s.activeProducts]
  ].map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

async function loadStores() {
  const stores = await ownerPendingStores();
  document.getElementById('pending-stores').innerHTML = stores.length
    ? stores.map((s) => `
      <div class="table-row">
        <div><strong>${esc(s.name)}</strong><span class="muted">${esc(s.description || 'Tanpa deskripsi')}</span></div>
        <button class="btn btn-primary btn-small" type="button" data-approve="${esc(s.id)}">Setujui</button>
      </div>`).join('')
    : `<p class="muted">Tidak ada pengajuan toko.</p>`;
}

async function loadVouchers() {
  const vouchers = await ownerVouchers();
  document.getElementById('voucher-table').innerHTML = vouchers.length
    ? vouchers.map((v) => `
      <div class="table-row">
        <div>
          <strong>${esc(v.code)}</strong>
          <span class="muted">${v.type === 'percent' ? `${v.value}%` : rupiah(v.value)} · dipakai ${v.usedCount}${v.usageLimit ? `/${v.usageLimit}` : ''}</span>
        </div>
        <button class="btn btn-ghost btn-small" type="button" data-toggle="${esc(v.id)}" data-active="${v.active}">${v.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
      </div>`).join('')
    : `<p class="muted">Belum ada voucher.</p>`;
}

async function loadOrders() {
  const orders = await ownerOrders();
  document.getElementById('order-table').innerHTML = orders.length
    ? orders.slice(0, 20).map((o) => `
      <div class="table-row">
        <div><strong>${esc(o.code)}</strong><span class="muted">${dateTime(o.createdAt)}</span></div>
        <div class="row-end"><span class="status status-${o.status}">${STATUS_LABEL[o.status]}</span><strong>${rupiah(o.total)}</strong></div>
      </div>`).join('')
    : `<p class="muted">Belum ada pesanan.</p>`;
}

function bindForms() {
  const form = document.getElementById('voucher-form');
  const errorEl = document.getElementById('voucher-form-error');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.textContent = '';
    try {
      await ownerCreateVoucher({
        code: form.code.value,
        type: form.type.value,
        value: Number(form.value.value),
        minSubtotal: Number(form.minSubtotal.value) || 0,
        maxDiscount: form.maxDiscount.value ? Number(form.maxDiscount.value) : null,
        usageLimit: form.usageLimit.value ? Number(form.usageLimit.value) : null,
        endsAt: form.endsAt.value || null
      });
      toast('Voucher dibuat');
      form.reset();
      await loadVouchers();
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });

  document.getElementById('voucher-table').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-toggle]');
    if (!button) return;
    await ownerToggleVoucher(button.dataset.toggle, button.dataset.active !== 'true');
    await loadVouchers();
  });

  document.getElementById('pending-stores').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-approve]');
    if (!button) return;
    await ownerApproveStore(button.dataset.approve);
    toast('Toko disetujui');
    await Promise.all([loadStores(), loadStats()]);
  });
}
