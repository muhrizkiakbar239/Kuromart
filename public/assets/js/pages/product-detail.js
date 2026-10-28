import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { icons } from '../core/icons.js';
import { getProductBySlug, getProductById } from '../core/api.js';
import { addItem } from '../core/cart.js';
import { renderReviews } from './product-detail-reviews.js';
import { wishlistIds, addToWishlist, removeFromWishlist } from '../core/api.js';
import { getUser } from '../core/auth.js';
import { params, rupiah, esc, productArt, discountPercent, toast } from '../core/utils.js';

renderHeader('products');
renderFooter();

const url = params();
const product = url.get('slug') ? await getProductBySlug(url.get('slug')) : await getProductById(url.get('id'));

const $ = (id) => document.getElementById(id);

if (!product) {
  $('detail').innerHTML = `<div class="empty-state"><h3>Produk tidak ditemukan</h3><a class="btn btn-primary" href="/pages/products.html">Kembali ke katalog</a></div>`;
} else {
  document.title = `${product.name} - KUROMART`;
  $('crumb').innerHTML = `<a href="/index.html">Beranda</a><span>/</span><a href="/pages/products.html?category=${esc(product.category)}">${esc(product.category)}</a><span>/</span><span>${esc(product.name)}</span>`;
  $('p-image').src = productArt(product);
  $('p-image').alt = product.name;
  $('p-store').textContent = product.store;
  $('p-name').textContent = product.name;
  $('p-rating').innerHTML = `${icons.star}<span>${product.rating.toFixed(1)}</span><span class="muted">${product.sold.toLocaleString('id-ID')} terjual</span>`;
  $('p-price').textContent = rupiah(product.price);
  $('p-compare').textContent = product.compareAt ? rupiah(product.compareAt) : '';
  const off = discountPercent(product.price, product.compareAt);
  $('p-discount').textContent = off ? `Hemat ${off}%` : '';
  $('p-desc').textContent = product.description;
  $('p-stock').textContent = product.stock > 10 ? 'Stok tersedia' : `Sisa ${product.stock} unit`;

  renderReviews(product.id);
  bindWishlist(product.id);

  if (product.variants.length) {
    $('variant-field').hidden = false;
    $('p-variant').innerHTML = `<option value="">Pilih ukuran</option>` +
      product.variants.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  }

  let qty = 1;
  const $qty = $('qty-value');
  document.querySelectorAll('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      qty = Math.min(product.stock, Math.max(1, qty + Number(btn.dataset.step)));
      $qty.textContent = qty;
    });
  });

  const readVariant = () => {
    const variant = $('p-variant').value;
    if (product.variants.length && !variant) {
      toast('Pilih ukuran terlebih dahulu');
      return null;
    }
    return variant;
  };

  $('btn-add').addEventListener('click', () => {
    const variant = readVariant();
    if (variant === null) return;
    addItem(product, { qty, variant });
    toast(`${product.name} ditambahkan ke keranjang`);
  });

  $('btn-buy').addEventListener('click', () => {
    const variant = readVariant();
    if (variant === null) return;
    addItem(product, { qty, variant });
    window.location.href = '/pages/cart.html';
  });
}

async function bindWishlist(productId) {
  const button = document.getElementById('btn-wish');
  if (!button || !getUser()) return;
  button.hidden = false;
  let saved = (await wishlistIds()).includes(productId);
  const paint = () => {
    button.textContent = saved ? 'Tersimpan di favorit' : 'Simpan ke favorit';
    button.setAttribute('aria-pressed', String(saved));
  };
  paint();
  button.addEventListener('click', async () => {
    try {
      if (saved) await removeFromWishlist(productId);
      else await addToWishlist(productId);
      saved = !saved;
      paint();
    } catch (err) {
      toast(err.message);
    }
  });
}
