import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { login } from '../core/api.js';
import { saveSession, safeNext } from '../core/auth.js';
import { toast } from '../core/utils.js';
import { params } from '../core/utils.js';

renderHeader('account');
renderFooter();

const form = document.getElementById('auth-form');
const errorEl = document.getElementById('form-error');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const session = await login({ email: form.email.value, password: form.password.value });
    saveSession(session);
    toast('Selamat datang kembali');
    const fallback = session.user.role === 'seller' ? '/pages/seller/products.html' : '/index.html';
    location.replace(safeNext(params().get('next'), fallback));
  } catch (err) {
    errorEl.textContent = err.message;
    button.disabled = false;
  }
});
