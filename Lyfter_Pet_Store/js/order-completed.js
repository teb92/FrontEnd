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
    ['Cliente', customer.fullName],
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
    const name = item.nombre || item.name || 'Producto';
    const qty = Number(item.cantidad || item.quantity || 1);
    const price = Number(item.precio || item.price || 0);

    const tr = document.createElement('tr');
    [name, qty, formatColones(price), formatColones(price * qty)].forEach((text) => {
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