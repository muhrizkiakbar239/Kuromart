import { adminClient, anonClient } from '../config/supabase.js';
import { HttpError } from '../utils/response.js';
import { findProfile } from '../repositories/users.repository.js';

function toSession(session, profile, email) {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
    user: { id: profile.id, email, fullName: profile.full_name, role: profile.role }
  };
}

export async function login({ email, password }) {
  const { data, error } = await anonClient().auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new HttpError(401, 'Email atau kata sandi salah.');
  const profile = await findProfile(data.user.id);
  if (!profile) throw new HttpError(403, 'Profil tidak ditemukan.');
  return toSession(data.session, profile, data.user.email);
}

export async function register({ email, password, fullName }) {
  const { error } = await adminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) throw new HttpError(409, 'Email sudah terdaftar.');
    throw error;
  }
  return login({ email, password });
}

export async function refresh(refreshToken) {
  const { data, error } = await anonClient().auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) throw new HttpError(401, 'Sesi sudah berakhir. Silakan masuk kembali.');
  const profile = await findProfile(data.user.id);
  if (!profile) throw new HttpError(403, 'Profil tidak ditemukan.');
  return toSession(data.session, profile, data.user.email);
}
