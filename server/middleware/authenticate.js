import { adminClient } from '../config/supabase.js';
import { HttpError } from '../utils/response.js';
import { findProfile } from '../repositories/users.repository.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new HttpError(401, 'Silakan masuk terlebih dahulu.');

    const { data, error } = await adminClient().auth.getUser(token);
    if (error || !data.user) throw new HttpError(401, 'Sesi tidak valid atau sudah berakhir.');

    const profile = await findProfile(data.user.id);
    if (!profile) throw new HttpError(403, 'Profil tidak ditemukan.');

    req.user = { id: profile.id, email: data.user.email, fullName: profile.full_name, role: profile.role };
    next();
  } catch (err) {
    next(err);
  }
}
