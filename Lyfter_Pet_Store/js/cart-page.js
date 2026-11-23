import {
  getCart,
  getCartTotal,
  getCartQuantity,
  hasStockFor,
  updateQuantity,
  removeFromCart
} from './cart.js';
import { refreshCart } from './cart-sync.js';
import { renderLayout, updateCartBadge } from './layout.js';
import { isLoggedIn } from './session.js';
import { renderLoginRequired, showToast } from './ui.js';
import { createElement, formatColones } from './utils.js';
import { createProductImage } from './product-ui.js';

export function renderCartPage() {
  const container = document.getElementById('cart-container');
  const totalElement = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!container || !totalElement) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.replaceChildren(createElement('p', 'empty-msg', 'Tu carrito está vacío'));
    totalElement.textContent = formatColones(0);
    if (checkoutBtn) checkoutBtn.style.display = 'none';
    return;
  }

  if (checkoutBtn) checkoutBtn.style.display = 'block';

  container.replaceChildren(...cart.map(createCartCard));
  totalElement.textContent = formatColones(getCartTotal());

  addCartEvents();
}

function createActionButton(className, text, action, productId, label) {
  const button = createElement('button', className, text);
  button.type = 'button';
  button.dataset.action = action;
  button.dataset.id = productId;
  if (label) button.setAttribute('aria-label', label);
  return button;
}

function createCartCard(item) {
  const { id, name, price, quantity } = item;
  const canAddMore = hasStockFor(item);

  const info = createElement('div', 'cart-card-info');
  info.appendChild(createElement('h3', '', name));
  info.appendChild(createElement('p', '', `Precio: ${formatColones(price)}`));

  const subtotal = createElement('p', '', 'Subtotal: ');
  subtotal.appendChild(createElement('strong', '', formatColones(price * quantity)));
  info.appendChild(subtotal);

  const increaseButton = createActionButton('btn-qty', '+', 'increase', id, 'Agregar una unidad');
  increaseButton.disabled = !canAddMore;

  const controls = createElement('div', 'cart-card-controls');
  controls.append(
    createActionButton('btn-qty', '-', 'decrease', id, 'Quitar una unidad'),
    createElement('span', '', quantity),
    increaseButton
  );
  info.appendChild(controls);

  if (!canAddMore) {
    info.appendChild(createElement('small', 'cart-stock-note', 'Máximo disponible en tu carrito'));
  }

  const card = createElement('div', 'cart-card');
  card.append(
    createProductImage(item, 'cart-card-image', 'cart-card-placeholder'),
    info,
    createActionButton('btn-delete', 'Eliminar', 'delete', id)
  );
  return card;
}

function addCartEvents() {
  const container = document.getElementById('cart-container');
  const checkoutBtn = document.getElementById('checkout-btn');

  container.onclick = (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const productId = btn.dataset.id;
    if (!action || !productId) return;

    const currentQty = getCartQuantity(productId);

    if (action === 'increase') {
      const item = getCart().find((cartItem) => String(cartItem.id) === productId);
      if (!item) return;
      if (!hasStockFor(item)) {
        showToast(`Solo hay ${item.stock} unidad(es) disponible(s) de este producto.`, 'error');
        return;
      }
      updateQuantity(productId, currentQty + 1);
    } else if (action === 'decrease') {
      if (currentQty > 1) {
        updateQuantity(productId, currentQty - 1);
      } else {
        removeFromCart(productId);
      }
    } else if (action === 'delete') {
      removeFromCart(productId);
    }

    renderCartPage();
    updateCartBadge();
  };

  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      window.location.href = 'summary.html';
    };
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  renderLayout();

  if (!isLoggedIn()) {
    renderLoginRequired(document.querySelector('main'));
    return;
  }

  const loading = createElement('p', 'loading-state', 'Cargando carrito...');
  loading.setAttribute('role', 'status');
  document.getElementById('cart-container').replaceChildren(loading);
  await refreshCart();
  renderCartPage();
  updateCartBadge();
});
