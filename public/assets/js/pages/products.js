import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { productCard, bindQuickAdd } from '../components/cards.js';
import { listCategories, listProducts } from '../core/api.js';
import { CONFIG } from '../core/config.js';
import { params, esc } from '../core/utils.js';

renderHeader('products');
renderFooter();

const url = params();
const state = {
  category: url.get('category') || '',
  q: url.get('q') || '',
  sort: url.get('sort') || 'popular',
  page: 1
};

const $chips = document.getElementById('category-chips');
const $grid = document.getElementById('product-grid');
const $count = document.getElementById('result-count');
const $more = document.getElementById('load-more');
const $sort = document.getElementById('sort-select');
const $search = document.getElementById('catalog-search');
const $title = document.getElementById('catalog-title');

const categories = await listCategories();
$chips.innerHTML = [{ slug: '', name: 'Semua' }, ...categories]
  .map((c) => `<button class="chip ${state.category === c.slug ? 'is-active' : ''}" type="button" data-cat="${esc(c.slug)}">${esc(c.name)}</button>`)
  .join('');

$sort.value = state.sort;
$search.value = state.q;

async function load(append = false) {
  const result = await listProducts({ ...state, perPage: CONFIG.perPage });
  const html = result.items.map(productCard).join('');
  $grid.innerHTML = append ? $grid.innerHTML + html : html;

  $count.textContent = `${result.total} produk ditemukan`;
  $more.hidden = result.page >= result.pages;
  $grid.classList.toggle('is-empty', result.total === 0);
  if (result.total === 0) {
    $grid.innerHTML = `<div class="empty-state"><h3>Produk tidak ditemukan</h3><p>Coba kata kunci lain atau pilih kategori berbeda.</p></div>`;
  }
  const active = categories.find((c) => c.slug === state.category);
  $title.textContent = active ? active.name : 'Semua produk';
}

$chips.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-cat]');
  if (!chip) return;
  state.category = chip.dataset.cat;
  state.page = 1;
  $chips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c === chip));
  load();
});

$sort.addEventListener('change', () => {
  state.sort = $sort.value;
  state.page = 1;
  load();
});

document.getElementById('catalog-form').addEventListener('submit', (e) => {
  e.preventDefault();
  state.q = $search.value;
  state.page = 1;
  load();
});

$more.addEventListener('click', () => {
  state.page += 1;
  load(true);
});

bindQuickAdd($grid);
load();
