import { adminClient } from '../config/supabase.js';

const SELECT = `
  id, slug, name, description, price, compare_at, stock, status, sold, rating,
  image_url, category_id, created_at,
  categories(slug, name),
  stores!inner(id, name, slug, status, owner_id)
`;

export function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price),
    compareAt: row.compare_at ? Number(row.compare_at) : 0,
    stock: row.stock,
    status: row.status,
    sold: Number(row.sold),
    rating: Number(row.rating),
    imageUrl: row.image_url,
    categoryId: row.category_id,
    category: row.categories?.slug ?? '',
    categoryName: row.categories?.name ?? '',
    store: row.stores?.name ?? '',
    storeId: row.stores?.id,
    storeStatus: row.stores?.status,
    variants: [],
    createdAt: row.created_at
  };
}

const ORDERS = {
  popular: ['sold', false],
  rating: ['rating', false],
  priceAsc: ['price', true],
  priceDesc: ['price', false],
  newest: ['created_at', false]
};

export async function findPublished({ categoryId, q, sort, from, to }) {
  let query = adminClient()
    .from('products')
    .select(SELECT, { count: 'exact' })
    .eq('status', 'active')
    .eq('stores.status', 'active');

  if (categoryId) query = query.eq('category_id', categoryId);

  const term = (q || '').replace(/[%,()*]/g, '').trim();
  if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);

  const [column, ascending] = ORDERS[sort] || ORDERS.popular;
  const { data, error, count } = await query.order(column, { ascending }).range(from, to);
  if (error) throw error;
  return { rows: data.map(mapProduct), total: count ?? 0 };
}

export async function findPublishedBySlug(slug) {
  const { data, error } = await adminClient()
    .from('products')
    .select(SELECT)
    .eq('slug', slug)
    .eq('status', 'active')
    .eq('stores.status', 'active')
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export async function findPublishedById(id) {
  const { data, error } = await adminClient()
    .from('products')
    .select(SELECT)
    .eq('id', id)
    .eq('status', 'active')
    .eq('stores.status', 'active')
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export async function findById(id) {
  const { data, error } = await adminClient().from('products').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export async function listByStore(storeId) {
  const { data, error } = await adminClient()
    .from('products')
    .select(SELECT)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapProduct);
}

export async function insert(row) {
  const { data, error } = await adminClient().from('products').insert(row).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function update(id, row) {
  const { error } = await adminClient()
    .from('products')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function findCategoryIdBySlug(slug) {
  const { data, error } = await adminClient().from('categories').select('id').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function listCategories() {
  const { data, error } = await adminClient().from('categories').select('id, slug, name').order('id');
  if (error) throw error;
  return data.map((c) => ({ id: c.id, slug: c.slug, name: c.name }));
}
