document.addEventListener('DOMContentLoaded', () => {
  const lastOrderData = localStorage.getItem('lastOrder');
  const container = document.getElementById('finished-order-details');

  if (!lastOrderData) {
    window.location.href = 'index.html';
    return;
  }

  const lastOrder = JSON.parse(lastOrderData);

  let html = `
    <table class="order-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
  `;

  lastOrder.items.forEach(item => {
    html += `
      <tr>
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>₡${item.precio.toLocaleString('es-CR')}</td>
        <td>₡${(item.precio * item.cantidad).toLocaleString('es-CR')}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <div class="order-total-row">
      <span>Total:</span>
      <strong>₡${lastOrder.total.toLocaleString('es-CR')}</strong>
    </div>
  `;

  container.innerHTML = html;
});