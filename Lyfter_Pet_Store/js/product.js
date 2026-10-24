import { getProductById } from './services/api.js';
import { addToCart, hasStockFor } from './cart.js';
import { renderLayout, updateCartBadge } from './layout.js';
import { renderErrorState, showToast } from './ui.js';
import { createElement, formatColones } from './utils.js';
import { createProductImage, createStockBadge, updateAddToCartButton } from './product-ui.js';

function getProductIdFromUrl() {
  const id = new URLSearchParams(window.location.search).get('id');
  return /^\d+$/.test(id ?? '') ? id : null;
}

function createBackLink() {
  const link = createElement('a', 'btn-secondary', 'Volver al catálogo');
  link.href = 'products.html';
  return link;
}

function renderProduct(product, container) {
  const stock = Number(product.stock || 0);
  document.title = `${product.nombre} - PawStore`;

  const info = createElement('div', 'product-detail-info');
  info.appendChild(createElement('h1', '', product.nombre));
  info.appendChild(createElement('p', 'product-detail-price', formatColones(product.precio)));
  if (product.categoria) {
    info.appendChild(createElement('p', 'product-detail-category', product.categoria));
  }
  info.appendChild(createStockBadge(stock));
  info.appendChild(createElement('p', 'product-detail-description', product.descripcion || 'Este producto aún no tiene descripción.'));

  const actions = createElement('div', 'product-detail-actions');
  const addButton = createElement('button', 'btn-primary');
  addButton.type = 'button';
  updateAddToCartButton(addButton, product);

  addButton.addEventListener('click', () => {
    if (!hasStockFor(product)) {
      showToast(`Solo hay ${stock} unidad(es) disponible(s) de este producto.`, 'error');
      return;
    }
    addToCart(product);
    updateAddToCartButton(addButton, product);
    updateCartBadge();
    showToast(`¡${product.nombre} añadido al carrito!`);
  });

  actions.append(addButton, createBackLink());
  info.appendChild(actions);

  const card = createElement('article', 'product-detail-card');
  card.append(createProductImage(product, 'product-detail-image', 'product-detail-placeholder'), info);

  container.innerHTML = '';
  container.appendChild(card);
}

function renderProductError(container, message, retry) {
  renderErrorState(container, { title: 'No pudimos mostrar el producto', message, onRetry: retry });
  container.querySelector('.error-state').appendChild(createBackLink());
}

async function loadProduct() {
  const container = document.getElementById('product-detail');
  const productId = getProductIdFromUrl();

  if (!productId) {
    renderProductError(container, 'El enlace del producto no es válido.');
    return;
  }

  container.innerHTML = '<p class="loading-state" role="status">Cargando producto...</p>';

  try {
    const product = await getProductById(productId);
    renderProduct(product, container);
  } catch (error) {
    console.error('Error al cargar el producto:', error);
    renderProductError(container, error.message, error.code === 'NOT_FOUND' ? undefined : loadProduct);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderLayout();
  loadProduct();
});