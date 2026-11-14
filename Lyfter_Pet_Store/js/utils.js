export const formatColones = (value) => `₡${Number(value || 0).toLocaleString('es-CR')}`;

export function getProductIdFromUrl() {
  const id = new URLSearchParams(window.location.search).get('id');
  return /^\d+$/.test(id ?? '') ? id : null;
}

export function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
