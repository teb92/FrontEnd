import { getCart, saveCart, getCartTotal } from './cart.js';
import { updateCartBadge } from './layout.js';

export function renderCartPage() {
  const container = document.getElementById('cart-container');
  const totalElement = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!container || !totalElement) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-msg">Tu carrito está vacío 🐾</p>';
    totalElement.textContent = '₡0';
    if (checkoutBtn) checkoutBtn.style.display = 'none';
    return;
  }

  if (checkoutBtn) checkoutBtn.style.display = 'block';

  container.innerHTML = cart.map((item, index) => {
    // 🛡️ Respaldos para datos e imagen
    const name = item.nombre || item.name || 'Producto';
    const price = Number(item.precio || item.price || 0);
    const qty = Number(item.cantidad || item.quantity || 1);
    const imgSrc = item.imagen || item.image || item.img || item.foto || 'https://via.placeholder.com/80?text=🐾';
    const subtotal = price * qty;

    return `
      <div class="cart-card">
        <img src="${imgSrc}" alt="${name}">
        <div class="cart-card-info">
          <h3>${name}</h3>
          <p>Precio: ₡${price.toLocaleString('es-CR')}</p>
          <p>Subtotal: <strong>₡${subtotal.toLocaleString('es-CR')}</strong></p>
          <div class="cart-card-controls">
            <button class="btn-qty" data-action="decrease" data-index="${index}">-</button>
            <span>${qty}</span>
            <button class="btn-qty" data-action="increase" data-index="${index}">+</button>
          </div>
        </div>
        <button class="btn-delete" data-action="delete" data-index="${index}">Eliminar</button>
      </div>
    `;
  }).join('');

  totalElement.textContent = `₡${getCartTotal().toLocaleString('es-CR')}`;

  addCartEvents();
}

function addCartEvents() {
  const container = document.getElementById('cart-container');
  const checkoutBtn = document.getElementById('checkout-btn');

  container.onclick = (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const index = Number(btn.dataset.index);
    const cart = getCart();

    if (action === 'increase') {
      cart[index].cantidad = Number(cart[index].cantidad || cart[index].quantity || 1) + 1;
    } else if (action === 'decrease') {
      const currentQty = Number(cart[index].cantidad || cart[index].quantity || 1);
      if (currentQty > 1) {
        cart[index].cantidad = currentQty - 1;
      } else {
        cart.splice(index, 1);
      }
    } else if (action === 'delete') {
      cart.splice(index, 1);
    }

    saveCart(cart);
    renderCartPage();
    updateCartBadge();
  };

  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      window.location.href = 'summary.html';
    };
  }
}

document.addEventListener('DOMContentLoaded', renderCartPage);