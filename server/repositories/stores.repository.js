import { adminClient } from '../config/supabase.js';

export async function findByOwner(ownerId) {
  const { data, error } = await adminClient().from('stores').select('*').eq('owner_id', ownerId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function findById(id) {
  const { data, error } = await adminClient().from('stores').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function create(row) {
  const { data, error } = await adminClient().from('stores').insert(row).select('*').single();
  if (error) throw error;
  return data;
}

export async function setStatus(id, status) {
  const { data, error } = await adminClient().from('stores').update({ status }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function listByStatus(status) {
  const { data, error } = await adminClient()
    .from('stores')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}
