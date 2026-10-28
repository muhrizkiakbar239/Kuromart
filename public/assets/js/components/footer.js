import { icons } from '../core/icons.js';

export function renderFooter() {
  const host = document.getElementById('app-footer');
  if (!host) return;
  host.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <img src="/assets/logo/kuromart-logo.svg" alt="KUROMART" height="72">
          <p class="footer-note">Marketplace multi-toko untuk kebutuhan harianmu, dari gadget sampai dapur.</p>
        </div>
        <div>
          <h4>Belanja</h4>
          <a href="/pages/products.html">Semua produk</a>
          <a href="/pages/products.html?category=elektronik">Elektronik</a>
          <a href="/pages/products.html?category=fashion">Fashion</a>
        </div>
        <div>
          <h4>Bantuan</h4>
          <a href="#">Cara belanja</a>
          <a href="#">Pengiriman</a>
          <a href="#">Pengembalian</a>
        </div>
        <div class="footer-perks">
          <span>${icons.truck} Pengiriman cepat</span>
          <span>${icons.shield} Transaksi aman</span>
          <span>${icons.refresh} Retur mudah</span>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>2026 KUROMART. Hak cipta dilindungi.</span>
      </div>
    </footer>`;
}
