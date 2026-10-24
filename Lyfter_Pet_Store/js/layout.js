import { getCart, getCartTotal } from './cart.js';

function countCartItems() {
  return getCart().reduce((acc, item) => acc + (item.cantidad || item.quantity || 1), 0);
}

export function renderLayout() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const totalItems = countCartItems();

  document.querySelector('.main-header')?.remove();
  document.getElementById('cart-modal')?.remove();
  document.querySelector('.main-footer')?.remove();

  const isAdmin =
    currentUser &&
    (currentUser.rol === 'admin' ||
      currentUser.role === 'admin' ||
      currentUser.email === 'admin@pawstore.com');

  const headerHTML = `
    <header class="main-header">
      <div class="logo">
        <a href="index.html">🐾 PawStore</a>
      </div>
      <nav class="nav-links" aria-label="Navegación principal">
        <a href="index.html">Inicio</a>
        <a href="products.html">Productos</a>
        <a href="contact.html">Contacto</a>
        ${isAdmin ? '<a href="admin.html">Administración</a>' : ''}
        <a href="cart.html" class="cart-link">🛒 (${totalItems})</a>
        ${currentUser ? `
          <span class="user-tag">Usuario: ${currentUser.nombre || currentUser.email || 'admin'}</span>
          <button id="logout-btn" class="btn-logout">Cerrar sesión</button>
        ` : `
          <a href="login.html" class="btn-primary">Iniciar sesión</a>
        `}
      </nav>
    </header>

    <!-- Floating cart modal -->
    <div id="cart-modal" class="modal-overlay" style="display: none;">
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="cart-modal-title">
        <div class="modal-header">
          <h2 id="cart-modal-title">Resumen del Carrito 🛒</h2>
          <button id="close-modal-btn" class="close-btn" aria-label="Cerrar resumen del carrito">&times;</button>
        </div>
        <div id="modal-cart-items" class="modal-body">
          <!-- Filled dynamically by openCartModal() -->
        </div>
        <div class="modal-footer">
          <div class="modal-total">
            <span>Total:</span>
            <strong id="modal-cart-total">₡0</strong>
          </div>
          <a href="cart.html" class="btn-primary">Ver carrito completo ➡️</a>
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

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    if (link.getAttribute('href') === currentPage) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
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
    container.innerHTML = '<p class="empty-msg">Tu carrito está vacío 🐾</p>';
    totalElement.textContent = '₡0';
  } else {
    container.innerHTML = cart.map(item => {
      const name = item.nombre || item.name || 'Producto';
      const price = Number(item.precio || item.price || 0);
      const qty = Number(item.cantidad || item.quantity || 1);
      const subtotal = price * qty;

      return `
        <div class="modal-item">
          <div>
            <strong>${name}</strong>
            <p class="modal-item-price">${qty} x ₡${price.toLocaleString('es-CR')}</p>
          </div>
          <span>₡${subtotal.toLocaleString('es-CR')}</span>
        </div>
      `;
    }).join('');

    totalElement.textContent = `₡${getCartTotal().toLocaleString('es-CR')}`;
  }

  modal.style.display = 'flex';
}

export function updateCartBadge() {
  const cartLink = document.querySelector('.cart-link');
  if (cartLink) {
    cartLink.textContent = `🛒 (${countCartItems()})`;
  }
}