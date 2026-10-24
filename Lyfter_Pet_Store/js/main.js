import { getProducts } from './services/api.js';
import { addToCart, hasStockFor } from './cart.js';
import { renderLayout, updateCartBadge } from './layout.js';
import { renderErrorState, showToast } from './ui.js';
import { createElement, formatColones } from './utils.js';
import { createProductImage, createStockBadge, updateAddToCartButton } from './product-ui.js';

let allProducts = [];

function createProductCard(product) {
  const stock = Number(product.stock || 0);
  const card = createElement('article', 'product-card');

  const info = createElement('div', 'product-card-info');
  info.appendChild(createElement('h3', '', product.nombre));
  if (product.categoria) {
    info.appendChild(createElement('p', 'product-card-category', product.categoria));
  }
  info.appendChild(createElement('p', 'price', formatColones(product.precio)));
  info.appendChild(createStockBadge(stock));

  const actions = createElement('div', 'card-actions');

  const addButton = createElement('button', 'btn-primary btn-add-cart');
  addButton.type = 'button';
  addButton.setAttribute('aria-label', `Añadir ${product.nombre} al carrito`);
  updateAddToCartButton(addButton, product);

  addButton.addEventListener('click', () => {
    if (!hasStockFor(product)) {
      showToast(`Solo hay ${stock} unidad(es) disponible(s) de este producto.`, 'error');
      updateAddToCartButton(addButton, product);
      return;
    }

    addToCart(product);
    updateAddToCartButton(addButton, product);
    updateCartBadge();
    showToast(`¡${product.nombre} añadido al carrito!`);
  });

  const detailsLink = createElement('a', 'btn-secondary btn-details', 'Ver detalles');
  detailsLink.href = `product.html?id=${encodeURIComponent(product.id)}`;

  actions.append(addButton, detailsLink);

  card.append(createProductImage(product, 'product-card-image', 'product-card-placeholder'), info, actions);
  return card;
}

function renderProducts(products) {
  const container = document.querySelector('#product-grid');
  const countElement = document.querySelector('#results-count');

  if (countElement) {
    countElement.textContent = `Mostrando ${products.length} producto(s)`;
  }

  container.innerHTML = '';

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No se encontraron productos</p>
        <small>Intenta cambiar los filtros o la búsqueda.</small>
      </div>
    `;
    return;
  }

  products.forEach(product => container.appendChild(createProductCard(product)));
}

function filterProducts() {
  const searchText = document.querySelector('#search-input').value.toLowerCase();
  const showOnlyAvailable = document.querySelector('#filter-available').checked;

  const filtered = allProducts.filter(product => {
    const matchesText = String(product.nombre).toLowerCase().includes(searchText);
    const matchesAvailability = showOnlyAvailable ? product.stock > 0 : true;
    return matchesText && matchesAvailability;
  });

  renderProducts(filtered);
}

async function loadProducts() {
  const container = document.querySelector('#product-grid');
  const countElement = document.querySelector('#results-count');

  container.innerHTML = '<p class="loading-state" role="status">Cargando productos...</p>';
  if (countElement) countElement.textContent = '';

  try {
    const products = await getProducts();
    if (!Array.isArray(products)) {
      throw new Error('El servidor devolvió una respuesta inesperada.');
    }

    allProducts = products;
    filterProducts();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    allProducts = [];
    renderErrorState(container, {
      title: 'No pudimos cargar los productos',
      message: error.message,
      onRetry: loadProducts
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderLayout();

  document.querySelector('#search-input')?.addEventListener('input', filterProducts);
  document.querySelector('#filter-available')?.addEventListener('change', filterProducts);

  loadProducts();
});