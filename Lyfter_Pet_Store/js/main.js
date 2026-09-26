//  Ubicación: js/main.js
import { getProducts } from './services/api.js';
import { addToCart } from './cart.js';
import { renderLayout, updateCartBadge } from './layout.js';

let allProducts = [];

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

  products.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="price">$${product.price}</p>
      <div class="card-actions">
        <button class="btn-primary btn-details">Ver detalles</button>
        <button class="btn-secondary btn-add-cart">Añadir 🛒</button>
      </div>
    `;

    card.querySelector('.btn-details').addEventListener('click', () => {
      window.location.href = `producto.html?id=${product.id}`;
    });

    card.querySelector('.btn-add-cart').addEventListener('click', () => {
      addToCart(product);
      updateCartBadge(); //  Actualiza el contador del header
      alert(`¡${product.name} añadido al carrito! 🛒`);
    });

    container.appendChild(card);
  });
}

function filterProducts() {
  const searchText = document.querySelector('#search-input').value.toLowerCase();
  const showOnlyAvailable = document.querySelector('#filter-available').checked;

  const filtered = allProducts.filter(product => {
    const matchesText = product.name.toLowerCase().includes(searchText);
    const matchesAvailability = showOnlyAvailable ? product.available === true : true;
    return matchesText && matchesAvailability;
  });

  renderProducts(filtered);
}

document.addEventListener('DOMContentLoaded', async () => {
  renderLayout(); //  Inyecta Header y Footer dinámicos

  try {
    allProducts = await getProducts();
    renderProducts(allProducts);

    const searchInput = document.querySelector('#search-input');
    if (searchInput) searchInput.addEventListener('input', filterProducts);

    const filterCheckbox = document.querySelector('#filter-available');
    if (filterCheckbox) filterCheckbox.addEventListener('change', filterProducts);

  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
});