import { adminClient } from '../config/supabase.js';

export async function findProfile(id) {
  const { data, error } = await adminClient()
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? { id: data.id, full_name: data.full_name, role: data.role } : null;
}

export async function setRole(id, role) {
  const { error } = await adminClient().from('profiles').update({ role }).eq('id', id);
  if (error) throw error;
}
