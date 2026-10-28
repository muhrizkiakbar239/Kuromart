import { adminClient } from '../config/supabase.js';
import { HttpError } from '../utils/response.js';

export async function list(user) {
  const { data, error } = await adminClient()
    .from('wishlists')
    .select('created_at, products(id, slug, name, price, compare_at, stock, status, image_url, rating, stores(name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data
    .filter((row) => row.products && row.products.status === 'active')
    .map((row) => ({
      id: row.products.id,
      slug: row.products.slug,
      name: row.products.name,
      price: Number(row.products.price),
      compareAt: row.products.compare_at ? Number(row.products.compare_at) : 0,
      imageUrl: row.products.image_url,
      rating: Number(row.products.rating),
      store: row.products.stores?.name ?? ''
    }));
}

export async function add(user, productId) {
  const { data: product } = await adminClient()
    .from('products').select('id').eq('id', productId).eq('status', 'active').maybeSingle();
  if (!product) throw new HttpError(404, 'Produk tidak ditemukan.');
  const { error } = await adminClient().from('wishlists').upsert({ user_id: user.id, product_id: productId });
  if (error) throw error;
  return { productId, saved: true };
}

export async function remove(user, productId) {
  const { error } = await adminClient().from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
  if (error) throw error;
  return { productId, saved: false };
}

export async function savedIds(user) {
  const { data, error } = await adminClient().from('wishlists').select('product_id').eq('user_id', user.id);
  if (error) throw error;
  return data.map((r) => r.product_id);
}
