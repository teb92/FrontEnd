export function normalizeOrder(order) {
  return {
    id: order.id,
    date: order.created_at,
    customer: order.customer_email ? `${order.customer_name} (${order.customer_email})` : order.customer_name,
    items: order.items,
    total: order.total
  };
}

export function summarizeItems(items) {
  if (items.length === 0) return '—';
  return items.map((item) => `${item.quantity} × ${item.name}`).join(', ');
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
