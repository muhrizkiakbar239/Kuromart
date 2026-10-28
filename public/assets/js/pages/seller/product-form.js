import { renderHeader } from '../../components/header.js';
import { renderFooter } from '../../components/footer.js';
import { requireLogin } from '../../core/auth.js';
import { listCategories, sellerGetProduct, sellerCreateProduct, sellerUpdateProduct } from '../../core/api.js';
import { params, productArt, readFileAsDataUrl, toast } from '../../core/utils.js';

renderHeader('seller');
renderFooter();

const user = requireLogin();
if (user) init(user);

async function init(user) {
  if (user.role !== 'seller') {
    location.replace('/pages/seller/apply.html');
    return;
  }

  const form = document.getElementById('product-form');
  const errorEl = document.getElementById('form-error');
  const preview = document.getElementById('p-preview');
  const id = params().get('id');
  let imageDataUrl;

  const categories = await listCategories();
  form.categoryId.innerHTML = categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');

  if (id) {
    try {
      const product = await sellerGetProduct(id);
      document.getElementById('form-title').textContent = 'Edit produk';
      form.name.value = product.name;
      form.categoryId.value = product.categoryId;
      form.description.value = product.description;
      form.price.value = product.price;
      form.compareAt.value = product.compareAt || '';
      form.stock.value = product.stock;
      form.status.value = product.status;
      preview.src = productArt(product);
      preview.hidden = false;
    } catch (err) {
      errorEl.textContent = err.message;
    }
  } else {
    preview.hidden = true;
  }

  form.image.addEventListener('change', async () => {
    const file = form.image.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      errorEl.textContent = 'Ukuran gambar maksimal 2 MB.';
      form.image.value = '';
      return;
    }
    imageDataUrl = await readFileAsDataUrl(file);
    preview.src = imageDataUrl;
    preview.hidden = false;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.textContent = '';
    const button = document.getElementById('submit-btn');
    button.disabled = true;

    const body = {
      name: form.name.value.trim(),
      categoryId: Number(form.categoryId.value),
      description: form.description.value.trim(),
      price: Number(form.price.value),
      compareAt: form.compareAt.value ? Number(form.compareAt.value) : null,
      stock: Number(form.stock.value),
      status: form.status.value
    };
    if (imageDataUrl) body.imageDataUrl = imageDataUrl;

    try {
      if (id) await sellerUpdateProduct(id, body);
      else await sellerCreateProduct(body);
      toast(id ? 'Produk diperbarui' : 'Produk ditambahkan');
      location.href = '/pages/seller/products.html';
    } catch (err) {
      errorEl.textContent = err.message;
      button.disabled = false;
    }
  });
}
