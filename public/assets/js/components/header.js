import { icons } from '../core/icons.js';
import { esc, params } from '../core/utils.js';
import { getCount, onCartChange } from '../core/cart.js';
import { getUser, logout } from '../core/auth.js';

export function renderHeader(active = '') {
  const host = document.getElementById('app-header');
  if (!host) return;
  const user = getUser();
  const q = params().get('q') || '';
  const links = [
    `<a href="/index.html" class="${active === 'home' ? 'is-active' : ''}">Beranda</a>`,
    `<a href="/pages/products.html" class="${active === 'products' ? 'is-active' : ''}">Katalog</a>`
  ];
  if (user) {
    links.push(`<a href="/pages/orders.html" class="${active === 'orders' ? 'is-active' : ''}">Pesanan</a>`);
    if (user.role === 'seller') links.push(`<a href="/pages/seller/products.html" class="${active === 'seller' ? 'is-active' : ''}">Toko saya</a>`);
    if (user.role === 'owner') links.push(`<a href="/pages/owner/dashboard.html" class="${active === 'owner' ? 'is-active' : ''}">Dashboard</a>`);
    links.push(`<a href="/pages/wishlist.html" class="${active === 'wishlist' ? 'is-active' : ''}">Favorit</a>`);
    links.push(`<a href="/pages/notifications.html" class="${active === 'notifications' ? 'is-active' : ''}">Notifikasi</a>`);
    links.push('<button class="nav-logout" type="button" data-logout>Keluar</button>');
  } else links.push(`<a href="/pages/login.html" class="${active === 'account' ? 'is-active' : ''}">Masuk</a>`);

  host.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand brand-nav" href="/index.html" aria-label="KUROMART beranda">
          <img src="/assets/logo/kuromart-nav.svg" alt="" width="44" height="44">
          <span class="brand-word"><strong>KURO</strong><b>MART</b></span>
        </a>
        <form class="search" action="/pages/products.html" method="get" role="search">
          <input type="search" name="q" value="${esc(q)}" placeholder="Cari produk, toko, atau merek" aria-label="Cari produk">
          <button type="submit" aria-label="Cari">${icons.search}</button>
        </form>
        <nav class="main-nav" aria-label="Menu utama">${links.join('')}</nav>
        <a class="icon-btn cart-btn ${active === 'cart' ? 'is-active' : ''}" href="/pages/cart.html" aria-label="Keranjang belanja">
          ${icons.cart}<span class="badge" data-cart-count hidden>0</span>
        </a>
      </div>
    </header>`;
  host.querySelector('[data-logout]')?.addEventListener('click', logout);
  const accountHref = !user ? '/pages/login.html' : user.role === 'seller' ? '/pages/seller/products.html' : '/pages/orders.html';
  const bottom = document.createElement('nav');
  bottom.className = 'bottom-nav';
  bottom.setAttribute('aria-label', 'Navigasi bawah');
  bottom.innerHTML = `
    <a href="/index.html" class="${active === 'home' ? 'is-active' : ''}">${icons.home}<span>Beranda</span></a>
    <a href="/pages/products.html" class="${active === 'products' ? 'is-active' : ''}">${icons.grid}<span>Katalog</span></a>
    <a href="/pages/cart.html" class="${active === 'cart' ? 'is-active' : ''}">${icons.cart}<span>Keranjang</span><span class="badge" data-cart-count hidden>0</span></a>
    <a href="${accountHref}" class="${['account', 'orders', 'seller', 'owner'].includes(active) ? 'is-active' : ''}">${icons.user}<span>${user ? (user.role === 'seller' ? 'Toko' : 'Akun') : 'Masuk'}</span></a>`;
  document.body.appendChild(bottom);
  updateCartBadges();
  onCartChange(updateCartBadges);
}
export function updateCartBadges() {
  const count = getCount();
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = count > 99 ? '99+' : count;
    el.hidden = count === 0;
  });
}