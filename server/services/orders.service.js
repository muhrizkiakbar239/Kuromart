import { adminClient } from '../config/supabase.js';
import { HttpError } from '../utils/response.js';
import { validateCheckout } from '../validators/order.validator.js';
import * as storesRepo from '../repositories/stores.repository.js';

const FIELDS = `id, code, status, payment_method, shipping_address, subtotal, discount, shipping_fee, total,
  voucher_code, courier, tracking_number, created_at, order_items(id, product_id, store_id, product_name, unit_price, qty, subtotal)`;

export function mapOrder(row) {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    paymentMethod: row.payment_method,
    address: row.shipping_address,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    voucherCode: row.voucher_code,
    courier: row.courier,
    trackingNumber: row.tracking_number,
    createdAt: row.created_at,
    items: (row.order_items || []).map((i) => ({
      id: i.id,
      productId: i.product_id,
      storeId: i.store_id,
      name: i.product_name,
      unitPrice: Number(i.unit_price),
      qty: i.qty,
      subtotal: Number(i.subtotal)
    }))
  };
}

async function fetchOrder(id, buyerId) {
  let query = adminClient().from('orders').select(FIELDS).eq('id', id);
  if (buyerId) query = query.eq('buyer_id', buyerId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, 'Pesanan tidak ditemukan.');
  return mapOrder(data);
}

export async function checkout(user, body) {
  const input = validateCheckout(body);
  const { data, error } = await adminClient().rpc('create_order', {
    p_buyer: user.id,
    p_items: input.items,
    p_address: input.address,
    p_method: input.paymentMethod,
    p_voucher: input.voucherCode
  });
  if (error) throw new HttpError(422, error.message);
  return fetchOrder(data, user.id);
}

export async function listMine(user) {
  const { data, error } = await adminClient()
    .from('orders').select(FIELDS).eq('buyer_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapOrder);
}

export async function getMine(user, id) {
  return fetchOrder(id, user.id);
}

// Pembeli: batalkan (selama diproses) atau tandai selesai (setelah dikirim).
export async function updateBuyerStatus(user, id, status) {
  const order = await fetchOrder(id, user.id);
  const db = adminClient();

  if (status === 'cancelled') {
    if (order.status !== 'processing') throw new HttpError(422, 'Pesanan tidak dapat dibatalkan lagi.');
    for (const item of order.items) {
      if (!item.productId) continue;
      const { data: p } = await db.from('products').select('stock, sold').eq('id', item.productId).single();
      if (p) {
        await db.from('products').update({
          stock: p.stock + item.qty,
          sold: Math.max(0, p.sold - item.qty)
        }).eq('id', item.productId);
      }
    }
  } else if (status === 'completed') {
    if (order.status !== 'shipped') throw new HttpError(422, 'Pesanan belum dikirim.');
  } else {
    throw new HttpError(422, 'Status tidak valid.');
  }

  await db.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  await db.from('notifications').insert({
    user_id: user.id,
    title: status === 'cancelled' ? 'Pesanan dibatalkan' : 'Pesanan selesai',
    body: `Pesanan ${order.code} sudah ${status === 'cancelled' ? 'dibatalkan' : 'selesai'}.`
  });
  return fetchOrder(id, user.id);
}

// Seller
export async function listStoreOrders(user) {
  const store = await storesRepo.findByOwner(user.id);
  if (!store || store.status !== 'active') throw new HttpError(403, 'Toko Anda belum aktif.');

  const { data, error } = await adminClient()
    .from('order_items')
    .select('qty, product_name, unit_price, subtotal, orders!inner(id, code, status, payment_method, shipping_address, created_at)')
    .eq('store_id', store.id);
  if (error) throw error;

  const grouped = new Map();
  for (const row of data) {
    const o = row.orders;
    if (!grouped.has(o.id)) {
      grouped.set(o.id, {
        id: o.id,
        code: o.code,
        status: o.status,
        paymentMethod: o.payment_method,
        address: o.shipping_address,
        createdAt: o.created_at,
        items: [],
        storeTotal: 0
      });
    }
    const g = grouped.get(o.id);
    g.items.push({ name: row.product_name, qty: row.qty, unitPrice: Number(row.unit_price), subtotal: Number(row.subtotal) });
    g.storeTotal += Number(row.subtotal);
  }
  return [...grouped.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function shipStoreOrder(user, orderId, status, shipping = {}) {
  if (status !== 'shipped') throw new HttpError(422, 'Seller hanya dapat menandai pesanan dikirim.');
  const store = await storesRepo.findByOwner(user.id);
  if (!store) throw new HttpError(403, 'Anda belum memiliki toko.');

  const db = adminClient();
  const { data: belongs } = await db.from('order_items')
    .select('id').eq('order_id', orderId).eq('store_id', store.id).limit(1).maybeSingle();
  if (!belongs) throw new HttpError(404, 'Pesanan tidak ditemukan di toko Anda.');

  const { data: order } = await db.from('orders').select('id, code, status, buyer_id').eq('id', orderId).single();
  if (order.status !== 'processing') throw new HttpError(422, 'Hanya pesanan yang sedang diproses dapat dikirim.');

  await db.from('orders').update({
    status: 'shipped',
    courier: shipping.courier || null,
    tracking_number: shipping.trackingNumber || null,
    updated_at: new Date().toISOString()
  }).eq('id', orderId);
  await db.from('notifications').insert({
    user_id: order.buyer_id,
    title: 'Pesanan dikirim',
    body: `Pesanan ${order.code} sedang dalam perjalanan. Konfirmasi setelah diterima.`
  });
  return { id: orderId, status: 'shipped' };
}
