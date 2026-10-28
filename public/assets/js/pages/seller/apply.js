import { renderHeader } from '../../components/header.js';
import { renderFooter } from '../../components/footer.js';
import { requireLogin } from '../../core/auth.js';
import { getMyStore, applyStore } from '../../core/api.js';
import { toast } from '../../core/utils.js';

renderHeader('seller');
renderFooter();

const user = requireLogin();
if (user) init(user);

async function init(user) {
  if (user.role === 'seller') {
    location.replace('/pages/seller/products.html');
    return;
  }

  const store = await getMyStore().catch(() => null);
  const form = document.getElementById('apply-form');
  const status = document.getElementById('apply-status');

  if (store) {
    form.hidden = true;
    status.hidden = false;
    status.textContent = store.status === 'pending'
      ? `Pengajuan toko "${store.name}" sedang ditinjau tim KUROMART.`
      : `Toko "${store.name}" berstatus ${store.status}.`;
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorEl = document.getElementById('form-error');
    errorEl.textContent = '';
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await applyStore({ name: form.name.value, description: form.description.value });
      toast('Pengajuan terkirim');
      form.hidden = true;
      status.hidden = false;
      status.textContent = 'Pengajuan toko kamu sudah terkirim dan sedang ditinjau tim KUROMART.';
    } catch (err) {
      errorEl.textContent = err.message;
      button.disabled = false;
    }
  });
}
