const HISTORY_KEY = 'salesHistory';
const HISTORY_LIMIT = 200;

export function getLocalSales() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

export function buildSale({ cart, total, customerName, customerEmail }) {
  return {
    id: `LOCAL-${Date.now()}`,
    date: new Date().toISOString(),
    customer: customerEmail ? `${customerName} (${customerEmail})` : customerName,
    items: cart.map((item) => ({
      name: item.nombre || item.name || 'Producto',
      quantity: Number(item.cantidad || item.quantity || 1),
      price: Number(item.precio || item.price || 0)
    })),
    total
  };
}

export function recordSale(sale) {
  const history = getLocalSales();
  history.push(sale);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-HISTORY_LIMIT)));
}

export function normalizeOrder(raw) {
  const rawItems = raw.items || raw.productos || raw.detalle || [];

  const items = Array.isArray(rawItems)
    ? rawItems.map((item) => ({
        name: item.nombre || item.name || item.producto || `Producto #${item.id ?? item.product_id ?? '?'}`,
        quantity: Number(item.cantidad || item.quantity || 1),
        price: item.precio ?? item.price ?? item.precio_unitario ?? null
      }))
    : [];

  let customer = raw.cliente || raw.customer || raw.usuario || raw.user || '';
  let email = raw.email || raw.correo || raw.user_email || '';
  if (customer && typeof customer === 'object') {
    email = email || customer.email || '';
    customer = customer.nombre || customer.name || customer.fullName || '';
  }
  const customerLabel = customer && email && !String(customer).includes(email)
    ? `${customer} (${email})`
    : (customer || email);

  let total = raw.total ?? raw.monto ?? null;
  if (total === null && items.length > 0 && items.every((item) => item.price !== null)) {
    total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }

  return {
    id: raw.id ?? raw.order_id ?? '—',
    date: raw.fecha || raw.date || raw.created_at || raw.createdAt || null,
    customer: String(customerLabel),
    items,
    total: total === null ? null : Number(total)
  };
}

export function summarizeItems(items) {
  if (items.length === 0) return '—';
  return items.map((item) => `${item.quantity} × ${item.name}`).join(', ');
}

export function formatOrderId(id) {
  const text = String(id);

  const local = /^LOCAL-(\d+)$/.exec(text);
  if (local) return `L-${Number(local[1]).toString(36).toUpperCase()}`;

  return text.length > 12 ? `${text.slice(0, 8)}…` : text;
}

export function formatSaleDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' });
}

export function sortNewestFirst(orders) {
  const time = (order) => Date.parse(order.date) || 0;
  return [...orders].sort((a, b) => time(b) - time(a));
}