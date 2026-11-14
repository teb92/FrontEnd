import { getCart, getCartTotal, clearCart } from './cart.js';
import { refreshCart } from './cart-sync.js';
import { createElement, formatColones } from './utils.js';
import { createOrder } from './services/api.js';
import { renderLayout, updateCartBadge } from './layout.js';
import { attachInputMask, formatCardNumber, formatExpiry, formatCvv } from './input-masks.js';
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

function createSummaryItem(item) {
  const { name, price, quantity } = item;

  const title = createElement('p');
  title.appendChild(createElement('strong', '', name));

  const details = createElement('div');
  details.append(title, createElement('small', '', `${quantity} x ${formatColones(price)}`));

  const row = createElement('div', 'summary-item');
  row.append(details, createElement('div', '', formatColones(price * quantity)));
  return row;
}

function renderOrderSummary() {
  const cart = getCart();
  const itemsContainer = document.getElementById('order-items-list');
  const totalElement = document.getElementById('order-total');

  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  itemsContainer.replaceChildren(...cart.map(createSummaryItem));

  totalElement.textContent = formatColones(getCartTotal());
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

document.addEventListener('DOMContentLoaded', async () => {
  renderLayout();

  if (!currentUser) {
    renderLoginRequired(document.querySelector('main'));
    return;
  }

  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  if (currentUser.name) nameInput.value = currentUser.name;
  if (currentUser.email) emailInput.value = currentUser.email;

  await refreshCart();
  updateCartBadge();
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

    const itemsToSend = cart.map(item => ({ id: item.id, quantity: item.quantity }));

    loadingOverlay.style.display = 'flex';

    try {
      const customer = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        address: document.getElementById('address').value.trim(),
        phone: document.getElementById('phone').value.trim()
      };

      const { order } = await createOrder({ items: itemsToSend, customer, userId: currentUser.id });

      localStorage.setItem('lastOrder', JSON.stringify({ items: order.items, total: order.total, customer }));

      clearCart();
      window.location.href = 'order-completed.html';
    } catch (error) {
      loadingOverlay.style.display = 'none';
      console.error('Error al finalizar la compra:', error);
      showFormMessage(checkoutForm, `No se pudo completar la compra: ${error.message}`);
    }
  });
});
