const KEY = 'kuromart_session';

export function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(KEY));
    if (!session) return null;
    if (session.expiresAt && session.expiresAt * 1000 < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // penyimpanan tidak tersedia; pengguna perlu masuk ulang
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // abaikan
  }
}

export const getUser = () => getSession()?.user ?? null;

export function logout() {
  clearSession();
  window.location.href = '/index.html';
}

// Mengarahkan ke halaman masuk jika belum login. Mengembalikan user atau null.
export function requireLogin() {
  const user = getUser();
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    location.replace(`/pages/login.html?next=${next}`);
    return null;
  }
  return user;
}

// Hanya izinkan path internal untuk parameter next, mencegah open redirect.
export function safeNext(value, fallback = '/index.html') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}
