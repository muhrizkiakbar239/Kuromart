import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { register } from '../core/api.js';
import { saveSession, safeNext } from '../core/auth.js';
import { params, toast } from '../core/utils.js';

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
    const session = await register({
      fullName: form.fullName.value,
      email: form.email.value,
      password: form.password.value
    });
    saveSession(session);
    toast('Akun berhasil dibuat');
    location.replace(safeNext(params().get('next'), '/index.html'));
  } catch (err) {
    errorEl.textContent = err.message;
    button.disabled = false;
  }
});
