import { adminClient } from '../config/supabase.js';
import { HttpError } from '../utils/response.js';

export async function stats() {
  const db = adminClient();
  const count = async (table, filters = (q) => q) => {
    const { count: n, error } = await filters(db.from(table).select('*', { count: 'exact', head: true }));
    if (error) throw error;
    return n ?? 0;
  };

  const [activeStores, pendingStores, activeProducts, totalOrders, processing] = await Promise.all([
    count('stores', (q) => q.eq('status', 'active')),
    count('stores', (q) => q.eq('status', 'pending')),
    count('products', (q) => q.eq('status', 'active')),
    count('orders', (q) => q.neq('status', 'cancelled')),
    count('orders', (q) => q.eq('status', 'processing'))
  ]);

  const { data: revenueRows, error } = await db.from('orders').select('total').in('status', ['shipped', 'completed', 'processing']);
  if (error) throw error;
  const revenue = revenueRows.reduce((sum, r) => sum + Number(r.total), 0);

  return { activeStores, pendingStores, activeProducts, totalOrders, processingOrders: processing, revenue };
}

export async function listOrders() {
  const { data, error } = await adminClient()
    .from('orders')
    .select('id, code, status, total, payment_method, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data.map((o) => ({
    id: o.id, code: o.code, status: o.status, total: Number(o.total),
    paymentMethod: o.payment_method, createdAt: o.created_at
  }));
}

export async function listVouchers() {
  const { data, error } = await adminClient().from('vouchers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((v) => ({
    id: v.id, code: v.code, type: v.type, value: Number(v.value),
    minSubtotal: Number(v.min_subtotal), maxDiscount: v.max_discount ? Number(v.max_discount) : null,
    usageLimit: v.usage_limit, usedCount: v.used_count, endsAt: v.ends_at, active: v.active
  }));
}

export async function createVoucher(row) {
  const { error } = await adminClient().from('vouchers').insert(row);
  if (error) {
    if (error.code === '23505') throw new HttpError(409, 'Kode voucher sudah dipakai.');
    throw error;
  }
  return { code: row.code };
}

export async function setVoucherActive(id, active) {
  const { error } = await adminClient().from('vouchers').update({ active }).eq('id', id);
  if (error) throw error;
  return { id, active };
}

// Pratinjau diskon untuk ditampilkan di keranjang. Angka final dihitung ulang saat checkout.
export async function previewVoucher(code, subtotal) {
  const { data: v } = await adminClient().from('vouchers').select('*').eq('code', code).maybeSingle();
  const now = Date.now();
  const valid = v && v.active && new Date(v.starts_at) <= now && (!v.ends_at || new Date(v.ends_at) > now)
    && (v.usage_limit === null || v.used_count < v.usage_limit);
  if (!valid) throw new HttpError(404, 'Voucher tidak valid atau sudah kedaluwarsa.');
  if (subtotal < Number(v.min_subtotal)) {
    throw new HttpError(422, `Belanja minimal ${Number(v.min_subtotal).toLocaleString('id-ID')} untuk voucher ini.`);
  }
  let discount = v.type === 'percent' ? Math.floor((subtotal * Number(v.value)) / 100) : Number(v.value);
  if (v.max_discount) discount = Math.min(discount, Number(v.max_discount));
  discount = Math.min(discount, subtotal);
  return { code: v.code, type: v.type, value: Number(v.value), discount };
}
