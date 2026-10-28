import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateProduct } from '../../server/validators/product.validator.js';
import { validateCheckout, validateReview, validateNewVoucher } from '../../server/validators/order.validator.js';
import { validateRegister } from '../../server/validators/user.validator.js';
import { validateStore } from '../../server/validators/store.validator.js';

const UUID = '3f1c2b4a-1111-4222-8333-944455556666';

test('produk valid lolos validasi dan kolom opsional diabaikan', () => {
  const out = validateProduct({ name: 'Sepatu Lari', categoryId: 3, price: 150000, stock: 5 });
  assert.equal(out.name, 'Sepatu Lari');
  assert.equal(out.compareAt, undefined);
});

test('produk tanpa harga ditolak', () => {
  assert.throws(() => validateProduct({ name: 'Sepatu', categoryId: 3, stock: 5 }), /price wajib diisi/);
});

test('harga di bawah Rp100 ditolak', () => {
  assert.throws(() => validateProduct({ name: 'Sepatu', categoryId: 3, price: 50, stock: 1 }), /Harga minimal/);
});

test('mode partial menerima update parsial', () => {
  assert.deepEqual(validateProduct({ stock: 9 }, true), { stock: 9 });
});

test('checkout valid menormalkan kode voucher', () => {
  const out = validateCheckout({
    items: [{ productId: UUID, qty: 2 }],
    address: { name: 'Budi Santoso', phone: '081234567890', street: 'Jl. Merdeka 1', city: 'Jakarta', postalCode: '10110' },
    paymentMethod: 'cod',
    voucherCode: ' hemat25k '
  });
  assert.equal(out.voucherCode, 'HEMAT25K');
  assert.equal(out.items[0].qty, 2);
});

test('checkout dengan keranjang kosong ditolak', () => {
  assert.throws(() => validateCheckout({ items: [] }), /Keranjang kosong/);
});

test('checkout dengan metode pembayaran tidak dikenal ditolak', () => {
  assert.throws(() => validateCheckout({
    items: [{ productId: UUID, qty: 1 }],
    address: { name: 'Budi Santoso', phone: '081234567890', street: 'Jl. Merdeka 1', city: 'Jakarta', postalCode: '10110' },
    paymentMethod: 'crypto'
  }), /Metode pembayaran/);
});

test('rating ulasan harus 1 sampai 5', () => {
  assert.throws(() => validateReview({ productId: UUID, rating: 6 }), /Rating/);
  assert.equal(validateReview({ productId: UUID, rating: 4, comment: ' bagus ' }).comment, 'bagus');
});

test('diskon persen di atas 100 ditolak', () => {
  assert.throws(() => validateNewVoucher({ code: 'DISKON', type: 'percent', value: 150 }), /maksimal 100/);
});

test('voucher nominal valid dipetakan ke nama kolom database', () => {
  const row = validateNewVoucher({ code: 'hemat10', type: 'fixed', value: 10000, minSubtotal: 50000 });
  assert.equal(row.code, 'HEMAT10');
  assert.equal(row.min_subtotal, 50000);
});

test('registrasi menormalkan email dan memvalidasi kata sandi', () => {
  const out = validateRegister({ email: ' Budi@Mail.com ', password: '12345678', fullName: 'Budi Santoso' });
  assert.equal(out.email, 'budi@mail.com');
  assert.throws(() => validateRegister({ email: 'a@b.co', password: 'pendek', fullName: 'Budi' }), /minimal 8/);
});

test('nama toko terlalu pendek ditolak', () => {
  assert.throws(() => validateStore({ name: 'AB' }), /3 sampai 80/);
});
