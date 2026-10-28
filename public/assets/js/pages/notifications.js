import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { requireLogin } from '../core/auth.js';
import { myNotifications, markNotificationsRead } from '../core/api.js';
import { esc } from '../core/utils.js';
import { dateTime } from '../core/format.js';

renderHeader('notifications');
renderFooter();

if (requireLogin()) load();

async function load() {
  const list = document.getElementById('notif-list');
  const { unread, items } = await myNotifications();
  if (!items.length) {
    list.innerHTML = `<div class="empty-state"><h3>Belum ada notifikasi</h3></div>`;
    return;
  }
  list.innerHTML = items.map((n) => `
    <article class="notif ${n.isRead ? '' : 'is-unread'}">
      <h3>${esc(n.title)}</h3>
      <p>${esc(n.body)}</p>
      <span class="muted">${dateTime(n.createdAt)}</span>
    </article>`).join('');
  if (unread) await markNotificationsRead();
}
