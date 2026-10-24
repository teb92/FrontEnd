import { getCart } from './cart.js';
import { createOrder } from './services/api.js';
import { renderLayout } from './layout.js';
import { attachInputMask, formatCardNumber, formatExpiry, formatCvv } from './input-masks.js';
import { buildSale, recordSale } from './sales.js';
import { getCurrentUser } from './session.js';
import {
  prepareForm,
  applyFieldErrors,
  showFormMessage,
  clearFormMessage,
  renderLoginRequired
} from './ui.js';
import {
  validateFullName,
  validateEmail,
  validateAddress,
  validatePhone,
  validateCardNumber,
  validateCardExpiry,
  validateCardCvv
} from './validators.js';

const currentUser = getCurrentUser();

function calculateTotal(cart) {
  return cart.reduce((acc, item) => {
    const price = Number(item.precio || item.price || 0);
    const qty = Number(item.cantidad || item.quantity || 1);
    return acc + (price * qty);
  }, 0);
}

function renderOrderSummary() {
  const cart = getCart();
  const itemsContainer = document.getElementById('order-items-list');
  const totalElement = document.getElementById('order-total');

  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  itemsContainer.innerHTML = '';
  cart.forEach(item => {
    const qty = Number(item.cantidad || item.quantity || 1);
    const price = Number(item.precio || item.price || 0);
    const name = item.nombre || item.name || 'Producto';

    const itemElement = document.createElement('div');
    itemElement.className = 'summary-item';
    itemElement.innerHTML = `
      <div>
        <p><strong>${name}</strong></p>
        <small>${qty} x ₡${price.toLocaleString('es-CR')}</small>
      </div>
      <div>₡${(price * qty).toLocaleString('es-CR')}</div>
    `;
    itemsContainer.appendChild(itemElement);
  });

  totalElement.textContent = `₡${calculateTotal(cart).toLocaleString('es-CR')}`;
}

function validateCheckoutForm(form) {
  const valueOf = (id) => form.querySelector(`#${id}`).value;

  return {
    fullName: validateFullName(valueOf('fullName')),
    email: validateEmail(valueOf('email')),
    address: validateAddress(valueOf('address')),
    phone: validatePhone(valueOf('phone')),
    cardNumber: validateCardNumber(valueOf('cardNumber')),
    cardExpiry: validateCardExpiry(valueOf('cardExpiry')),
    cardCvv: validateCardCvv(valueOf('cardCvv'))
  };
}

document.addEventListener('DOMContentLoaded', () => {
  renderLayout();

  if (!currentUser) {
    renderLoginRequired(document.querySelector('main'));
    return;
  }

  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  if (currentUser.nombre) nameInput.value = currentUser.nombre;
  if (currentUser.email) emailInput.value = currentUser.email;

  renderOrderSummary();

  attachInputMask(document.getElementById('cardNumber'), formatCardNumber, {
    inputmode: 'numeric',
    autocomplete: 'cc-number'
  });
  attachInputMask(document.getElementById('cardExpiry'), formatExpiry, {
    inputmode: 'numeric',
    autocomplete: 'cc-exp'
  });
  attachInputMask(document.getElementById('cardCvv'), formatCvv, {
    inputmode: 'numeric',
    autocomplete: 'cc-csc'
  });

  const checkoutForm = document.getElementById('checkout-form');
  const loadingOverlay = document.getElementById('loading-overlay');
  prepareForm(checkoutForm);

  checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormMessage(checkoutForm);

    const isValid = applyFieldErrors(checkoutForm, validateCheckoutForm(checkoutForm));
    if (!isValid) {
      showFormMessage(checkoutForm, 'Por favor completa todos los campos correctamente.');
      return;
    }

    const cart = getCart();
    if (cart.length === 0) {
      window.location.href = 'cart.html';
      return;
    }

    const itemsToSend = cart.map(item => ({
      id: item.id,
      cantidad: Number(item.cantidad || item.quantity || 1)
    }));

    loadingOverlay.style.display = 'flex';

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const customer = {
        nombre: nameInput.value.trim(),
        email: emailInput.value.trim(),
        direccion: document.getElementById('address').value.trim(),
        telefono: document.getElementById('phone').value.trim()
      };

      const response = await createOrder({ items: itemsToSend, customer, userId: currentUser.id });
      const savedOrder = response?.order;

      localStorage.setItem('lastOrder', JSON.stringify({
        items: savedOrder ? savedOrder.items : cart,
        total: savedOrder ? savedOrder.total : calculateTotal(cart),
        customer: {
          fullName: customer.nombre,
          email: customer.email,
          address: customer.direccion,
          phone: customer.telefono
        }
      }));

      if (!savedOrder) {
        recordSale(buildSale({
          cart,
          total: calculateTotal(cart),
          customerName: customer.nombre,
          customerEmail: customer.email
        }));
      }

      localStorage.removeItem('cart');
      window.location.href = 'order-completed.html';
    } catch (error) {
      loadingOverlay.style.display = 'none';
      console.error('Error al finalizar la compra:', error);
      showFormMessage(checkoutForm, `No se pudo completar la compra: ${error.message}`);
    }
  });
});