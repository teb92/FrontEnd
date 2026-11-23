import { getCart, getCartCount, getCartTotal } from './cart.js';
import { createElement, formatColones } from './utils.js';
import { getCurrentUser, isAdmin, clearSession } from './session.js';

export function renderLayout() {
  const currentUser = getCurrentUser();

  document.querySelector('.main-header')?.remove();
  document.getElementById('cart-modal')?.remove();
  document.querySelector('.main-footer')?.remove();

  const headerHTML = `
    <header class="main-header">
      <div class="logo">
        <a href="index.html">PawStore</a>
      </div>
      <nav class="nav-links" aria-label="Navegación principal">
        <a href="index.html">Inicio</a>
        <a href="products.html">Productos</a>
        <a href="contact.html">Contacto</a>
        ${isAdmin() ? '<a href="admin.html">Administración</a>' : ''}
        <a href="cart.html" class="cart-link"></a>
        ${currentUser ? `
          <span class="user-tag"></span>
          <button id="logout-btn" class="btn-logout">Cerrar sesión</button>
        ` : `
          <a href="login.html" class="btn-primary">Iniciar sesión</a>
        `}
      </nav>
    </header>

    <div id="cart-modal" class="modal-overlay" style="display: none;">
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="cart-modal-title">
        <div class="modal-header">
          <h2 id="cart-modal-title">Resumen del Carrito</h2>
          <button id="close-modal-btn" class="close-btn" aria-label="Cerrar resumen del carrito">&times;</button>
        </div>
        <div id="modal-cart-items" class="modal-body">
        </div>
        <div class="modal-footer">
          <div class="modal-total">
            <span>Total:</span>
            <strong id="modal-cart-total">₡0</strong>
          </div>
          <a href="cart.html" class="btn-primary">Ver carrito completo</a>
        </div>
      </div>
    </div>
  `;

  const footerHTML = `
    <footer class="main-footer">
      <p>&copy; ${new Date().getFullYear()} PawStore — Todos los derechos reservados.</p>
    </footer>
  `;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  updateCartBadge();
  if (currentUser) {
    document.querySelector('.user-tag').textContent = `Usuario: ${currentUser.name}`;
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    if (link.getAttribute('href') === currentPage) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = 'login.html';
    });
  }

  const cartLink = document.querySelector('.cart-link');
  if (cartLink) {
    cartLink.addEventListener('click', (e) => {
      e.preventDefault();
      openCartModal();
    });
  }

  const closeModalBtn = document.getElementById('close-modal-btn');
  const cartModal = document.getElementById('cart-modal');
  if (closeModalBtn && cartModal) {
    closeModalBtn.addEventListener('click', () => {
      cartModal.style.display = 'none';
    });

    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        cartModal.style.display = 'none';
      }
    });
  }
}

export function openCartModal() {
  const modal = document.getElementById('cart-modal');
  const container = document.getElementById('modal-cart-items');
  const totalElement = document.getElementById('modal-cart-total');

  if (!modal || !container || !totalElement) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.replaceChildren(createElement('p', 'empty-msg', 'Tu carrito está vacío'));
  } else {
    container.replaceChildren(...cart.map(createModalItem));
  }
  totalElement.textContent = formatColones(getCartTotal());

  modal.style.display = 'flex';
}

function createModalItem(item) {
  const { name, price, quantity } = item;

  const details = createElement('div');
  details.append(
    createElement('strong', '', name),
    createElement('p', 'modal-item-price', `${quantity} x ${formatColones(price)}`)
  );

  const row = createElement('div', 'modal-item');
  row.append(details, createElement('span', '', formatColones(price * quantity)));
  return row;
}

export function updateCartBadge() {
  const cartLink = document.querySelector('.cart-link');
  if (cartLink) {
    cartLink.textContent = `Carrito (${getCartCount()})`;
  }
}
