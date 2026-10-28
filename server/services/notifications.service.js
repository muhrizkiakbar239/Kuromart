import { adminClient } from '../config/supabase.js';

export async function listMine(user) {
  const { data, error } = await adminClient()
    .from('notifications')
    .select('id, title, body, is_read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return {
    unread: data.filter((n) => !n.is_read).length,
    items: data.map((n) => ({ id: n.id, title: n.title, body: n.body, isRead: n.is_read, createdAt: n.created_at }))
  };
}

export async function markAllRead(user) {
  const { error } = await adminClient().from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  if (error) throw error;
  return { ok: true };
}
