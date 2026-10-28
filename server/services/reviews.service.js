import { adminClient } from '../config/supabase.js';
import { HttpError } from '../utils/response.js';

export async function createReview(user, { productId, rating, comment }) {
  const db = adminClient();

  // Hanya pembeli yang pesanannya sudah selesai yang boleh mengulas.
  const { data: purchase } = await db
    .from('order_items')
    .select('order_id, orders!inner(id, buyer_id, status)')
    .eq('product_id', productId)
    .eq('orders.buyer_id', user.id)
    .eq('orders.status', 'completed')
    .limit(1)
    .maybeSingle();
  if (!purchase) throw new HttpError(403, 'Ulasan hanya dapat diberikan setelah pesanan selesai.');

  const { data, error } = await db.from('reviews').insert({
    product_id: productId,
    user_id: user.id,
    order_id: purchase.order_id,
    rating,
    comment
  }).select('id, rating, comment, created_at').single();
  if (error) {
    if (error.code === '23505') throw new HttpError(409, 'Anda sudah mengulas produk ini.');
    throw error;
  }

  // Perbarui rata-rata rating produk.
  const { data: all } = await db.from('reviews').select('rating').eq('product_id', productId);
  const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
  await db.from('products').update({ rating: Math.round(avg * 10) / 10 }).eq('id', productId);

  return data;
}

export async function listForProduct(productId) {
  const { data, error } = await adminClient()
    .from('reviews')
    .select('id, rating, comment, created_at, profiles(full_name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    author: r.profiles?.full_name ?? 'Pembeli'
  }));
}
