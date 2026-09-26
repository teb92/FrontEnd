import { getCart } from './cart.js';

//  1. Session Guard (executes immediately)
const currentUserData = localStorage.getItem('currentUser');
if (!currentUserData) {
  window.location.href = 'login.html';
}

const currentUser = JSON.parse(currentUserData);

document.addEventListener('DOMContentLoaded', () => {
  //  2. Autofill logged-in user details
  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');

  if (nameInput && currentUser.nombre) nameInput.value = currentUser.nombre;
  if (emailInput && currentUser.email) emailInput.value = currentUser.email;

  // 3. Render items
  renderOrderSummary();

  // 4. Process order confirmation
  const checkoutForm = document.getElementById('checkout-form');
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const cart = getCart();

    // Save order details for completion view
    localStorage.setItem('lastOrder', JSON.stringify({
      items: cart,
      total: calculateTotal(cart),
      customer: {
        fullName: nameInput.value,
        email: emailInput.value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value
      }
    }));

    // 🧹 Clear shopping cart
    localStorage.removeItem('cart');

    // 🚀 Redirect to order completed view
    window.location.href = 'order-completed.html';
  });
});

function renderOrderSummary() {
  const cart = getCart();
  const itemsContainer = document.getElementById('order-items-list');
  const totalElement = document.getElementById('order-total');

  if (!cart || cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  itemsContainer.innerHTML = '';
  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'summary-item';
    itemElement.innerHTML = `
      <div>
        <p><strong>${item.nombre}</strong></p>
        <small>${item.cantidad} x ₡${item.precio.toLocaleString('es-CR')}</small>
      </div>
      <div>₡${(item.precio * item.cantidad).toLocaleString('es-CR')}</div>
    `;
    itemsContainer.appendChild(itemElement);
  });

  const total = calculateTotal(cart);
  totalElement.textContent = `₡${total.toLocaleString('es-CR')}`;
}

function calculateTotal(cart) {
  return cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
}