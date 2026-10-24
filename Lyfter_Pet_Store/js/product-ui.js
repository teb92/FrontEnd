import { hasStockFor } from './cart.js';
import { createElement } from './utils.js';

const LOW_STOCK_LIMIT = 5;

export function createProductImage(product, wrapperClass, placeholderClass) {
  const wrapper = createElement('div', wrapperClass);

  const showPlaceholder = () => {
    wrapper.innerHTML = '';
    wrapper.appendChild(createElement('div', placeholderClass, '🐾'));
  };

  if (!product.imagen) {
    showPlaceholder();
    return wrapper;
  }

  const image = document.createElement('img');
  image.src = product.imagen;
  image.alt = product.nombre;
  image.addEventListener('error', showPlaceholder);
  wrapper.appendChild(image);
  return wrapper;
}

export function createStockBadge(stock) {
  if (stock <= 0) {
    return createElement('p', 'stock-badge stock-badge--out', 'Agotado');
  }

  const units = stock === 1 ? '1 unidad' : `${stock} unidades`;
  if (stock <= LOW_STOCK_LIMIT) {
    return createElement('p', 'stock-badge stock-badge--low', `¡Últimas ${units}!`);
  }
  return createElement('p', 'stock-badge stock-badge--in', `Disponible: ${units}`);
}

export function updateAddToCartButton(button, product) {
  const stock = Number(product.stock || 0);

  if (stock <= 0) {
    button.disabled = true;
    button.textContent = 'Agotado';
  } else if (!hasStockFor(product)) {
    button.disabled = true;
    button.textContent = 'Máximo en tu carrito';
  } else {
    button.disabled = false;
    button.textContent = 'Añadir al carrito';
  }
}