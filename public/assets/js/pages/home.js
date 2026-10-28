import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { productCard, categoryTile, bindQuickAdd } from '../components/cards.js';
import { listCategories, getFeatured } from '../core/api.js';

renderHeader('home');
renderFooter();

const [categories, featured] = await Promise.all([listCategories(), getFeatured(8)]);

document.getElementById('category-grid').innerHTML = categories.map(categoryTile).join('');
const featuredGrid = document.getElementById('featured-grid');
featuredGrid.innerHTML = featured.map(productCard).join('');
bindQuickAdd(featuredGrid);
