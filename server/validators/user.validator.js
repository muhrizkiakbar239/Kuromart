import { HttpError } from '../utils/response.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(body = {}) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const fullName = String(body.fullName || '').trim();
  if (!EMAIL.test(email)) throw new HttpError(422, 'Email tidak valid.');
  if (password.length < 8) throw new HttpError(422, 'Kata sandi minimal 8 karakter.');
  if (fullName.length < 3 || fullName.length > 80) throw new HttpError(422, 'Nama lengkap harus 3 sampai 80 karakter.');
  return { email, password, fullName };
}

export function validateLogin(body = {}) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) throw new HttpError(422, 'Email dan kata sandi wajib diisi.');
  return { email, password };
}
