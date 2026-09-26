import { getCart, getCartTotal, saveCart } from './cart.js';

export function renderLayout() {
  // Leer usuario activo desde localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // Leer cantidad de ítems en el carrito para mostrar el contador
  const cart = getCart();
  const totalItems = cart.reduce((acc, item) => acc + (item.cantidad || item.quantity || 1), 0);

  //  Eliminar header y modal anteriores si ya existían para evitar duplicaciones
  const existingHeader = document.querySelector('.main-header');
  if (existingHeader) existingHeader.remove();
  
  const existingModal = document.getElementById('cart-modal');
  if (existingModal) existingModal.remove();

  // Construcción de la barra de navegación y la estructura del Modal flotante
  const headerHTML = `
    <header class="main-header">
      <div class="logo">
        <a href="index.html">🐾 PawStore</a>
      </div>
      <nav class="nav-links">
        <a href="index.html">Inicio</a>
        <a href="productos.html">Productos</a>
        <a href="contacto.html">Contacto</a>
        ${currentUser && currentUser.rol === 'admin' ? '<a href="admin.html">Administración</a>' : ''}
        <a href="carrito.html" class="cart-link">🛒 (${totalItems})</a>
        ${currentUser ? `
          <span class="user-tag">Usuario: ${currentUser.nombre || 'admin'}</span>
          <button id="logout-btn" class="btn-logout">Cerrar sesión</button>
        ` : `
          <a href="login.html" class="btn-primary">Iniciar sesión</a>
        `}
      </nav>
    </header>

    <!-- 🪟 Ventana Flotante (Modal) del Carrito -->
    <div id="cart-modal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Resumen del Carrito 🛒</h2>
          <button id="close-modal-btn" class="close-btn">&times;</button>
        </div>
        <div id="modal-cart-items" class="modal-body">
          <!-- Inyectado dinámicamente -->
        </div>
        <div class="modal-footer">
          <div class="modal-total">
            <span>Total:</span>
            <strong id="modal-cart-total">₡0</strong>
          </div>
          <a href="carrito.html" class="btn-primary">Ver carrito completo ➡️</a>
        </div>
      </div>
    </div>
  `;

  //  Insertar el header y el modal al inicio del <body>
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // Evento para cerrar la sesión activa
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }

  // Evento para abrir el modal flotante al hacer clic en el carrito
  const cartLink = document.querySelector('.cart-link');
  if (cartLink) {
    cartLink.addEventListener('click', (e) => {
      e.preventDefault(); //  Evita ir directo a carrito.html
      openCartModal();
    });
  }

  //  Evento para cerrar el modal
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cartModal = document.getElementById('cart-modal');
  if (closeModalBtn && cartModal) {
    closeModalBtn.addEventListener('click', () => {
      cartModal.style.display = 'none';
    });
    
    // Cerrar también si hace clic fuera del recuadro
    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        cartModal.style.display = 'none';
      }
    });
  }
}

//  Función para abrir y renderizar el contenido del Modal Flotante
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

  modal.style.display = 'flex'; // 👁️ Hace visible el modal
}

// Función para actualizar únicamente el número del carrito en el header
export function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((acc, item) => acc + (item.cantidad || item.quantity || 1), 0);
  
  const cartLink = document.querySelector('.cart-link');
  if (cartLink) {
    cartLink.textContent = `🛒 (${totalItems})`;
  }
}
