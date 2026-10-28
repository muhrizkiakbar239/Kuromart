export const STATUS_LABEL = {
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

export const METHOD_LABEL = {
  transfer: 'Transfer bank (demo)',
  ewallet: 'E-wallet (demo)',
  cod: 'Bayar di tempat'
};

export const dateTime = (iso) =>
  new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
