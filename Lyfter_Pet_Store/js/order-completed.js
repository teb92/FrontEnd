import { renderLayout } from './layout.js';
import { formatColones } from './utils.js';

function loadLastOrder() {
  try {
    return JSON.parse(localStorage.getItem('lastOrder'));
  } catch {
    return null;
  }
}

function renderCustomer(customer, box) {
  box.innerHTML = '';

  const fields = [
    ['Cliente', customer.name],
    ['Correo', customer.email],
    ['Dirección', customer.address]
  ];

  fields.forEach(([label, value]) => {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    p.append(strong, value || 'N/A');
    box.appendChild(p);
  });
}

function renderItems(items, tbody) {
  tbody.innerHTML = '';

  items.forEach((item) => {
    const { name, price, quantity } = item;

    const tr = document.createElement('tr');
    [name, quantity, formatColones(price), formatColones(price * quantity)].forEach((text) => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderLayout();

  const order = loadLastOrder();

  if (!order) {
    window.location.href = 'index.html';
    return;
  }

  if (order.customer) {
    renderCustomer(order.customer, document.getElementById('customer-details'));
  }

  renderItems(order.items || [], document.getElementById('order-items-container'));

  document.getElementById('order-total-display').textContent =
    `Total: ${formatColones(order.total || 0)}`;
});
