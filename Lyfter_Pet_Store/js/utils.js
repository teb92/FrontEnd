export const formatColones = (value) => `₡${Number(value || 0).toLocaleString('es-CR')}`;

export function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}