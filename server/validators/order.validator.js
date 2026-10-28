import { HttpError } from '../utils/response.js';

const METHODS = ['transfer', 'ewallet', 'cod'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (value, min, max, label) => {
  const s = String(value ?? '').trim();
  if (s.length < min || s.length > max) throw new HttpError(422, `${label} harus ${min} sampai ${max} karakter.`);
  return s;
};

export function validateCheckout(body = {}) {
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length || items.length > 50) throw new HttpError(422, 'Keranjang kosong atau terlalu banyak item.');

  const parsed = items.map((item) => {
    const qty = Number(item.qty);
    if (!UUID.test(item.productId || '') || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      throw new HttpError(422, 'Item keranjang tidak valid.');
    }
    return { productId: item.productId, qty };
  });

  const a = body.address || {};
  const address = {
    name: text(a.name, 3, 80, 'Nama penerima'),
    phone: text(a.phone, 8, 20, 'Nomor telepon'),
    street: text(a.street, 5, 200, 'Alamat'),
    city: text(a.city, 2, 80, 'Kota'),
    postalCode: text(a.postalCode, 3, 10, 'Kode pos')
  };

  if (!METHODS.includes(body.paymentMethod)) throw new HttpError(422, 'Metode pembayaran tidak valid.');

  return {
    items: parsed,
    address,
    paymentMethod: body.paymentMethod,
    voucherCode: body.voucherCode ? String(body.voucherCode).trim().toUpperCase() : null
  };
}

export function validateReview(body = {}) {
  const productId = body.productId;
  const rating = Number(body.rating);
  if (!UUID.test(productId || '')) throw new HttpError(422, 'Produk tidak valid.');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(422, 'Rating harus 1 sampai 5.');
  const comment = String(body.comment || '').trim();
  if (comment.length > 1000) throw new HttpError(422, 'Ulasan maksimal 1000 karakter.');
  return { productId, rating, comment };
}

export function validateVoucher(body = {}) {
  const code = String(body.code || '').trim().toUpperCase();
  if (!code) throw new HttpError(422, 'Kode voucher wajib diisi.');
  return { code };
}

export function validateNewVoucher(body = {}) {
  const code = String(body.code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{4,20}$/.test(code)) throw new HttpError(422, 'Kode voucher 4 sampai 20 huruf atau angka.');
  if (!['percent', 'fixed'].includes(body.type)) throw new HttpError(422, 'Jenis voucher tidak valid.');
  const value = Number(body.value);
  if (!Number.isInteger(value) || value <= 0) throw new HttpError(422, 'Nilai voucher tidak valid.');
  if (body.type === 'percent' && value > 100) throw new HttpError(422, 'Diskon persen maksimal 100.');
  if (body.type === 'fixed' && value < 1000) throw new HttpError(422, 'Diskon nominal minimal Rp1.000.');
  return {
    code,
    type: body.type,
    value,
    min_subtotal: Number(body.minSubtotal) || 0,
    max_discount: body.maxDiscount ? Number(body.maxDiscount) : null,
    usage_limit: body.usageLimit ? Number(body.usageLimit) : null,
    ends_at: body.endsAt ? new Date(body.endsAt).toISOString() : null
  };
}
