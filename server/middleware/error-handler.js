export function notFound(_req, res) {
  res.status(404).json({ success: false, message: 'Rute tidak ditemukan.' });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Terjadi kesalahan pada server.' : err.message
  });
}
