import { getProducts, createProduct, deleteProduct, getOrders } from './services/api.js';
import { renderLayout } from './layout.js';
import {
  prepareForm,
  applyFieldErrors,
  clearFieldErrors,
  showFormMessage,
  clearFormMessage,
  showToast,
  renderErrorState
} from './ui.js';
import { validateProductForm, readProductForm, fillCategoryOptions } from './product-form.js';
import { createElement, formatColones } from './utils.js';
import {
  getLocalSales,
  normalizeOrder,
  summarizeItems,
  formatSaleDate,
  sortNewestFirst
} from './sales.js';

renderLayout();

const productForm = document.getElementById('product-form');
const addButton = productForm.querySelector('button[type="submit"]');
const productsBody = document.getElementById('products-table-body');
const salesBody = document.getElementById('sales-table-body');
const salesNotice = document.getElementById('sales-notice');
const salesSummary = document.getElementById('sales-summary');

const PRODUCT_COLUMNS = 6;
const SALES_COLUMNS = 5;

prepareForm(productForm);

function showTableMessage(tbody, columns, text) {
  const row = document.createElement('tr');
  const cell = createElement('td', 'table-message', text);
  cell.colSpan = columns;
  row.appendChild(cell);
  tbody.replaceChildren(row);
}

function showTableError(tbody, columns, title, message, onRetry) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = columns;
  row.appendChild(cell);
  tbody.replaceChildren(row);
  renderErrorState(cell, { title, message, onRetry });
}

function createProductRow(product) {
  const row = document.createElement('tr');

  [product.id, product.nombre, formatColones(product.precio), product.categoria, product.stock].forEach((value) => {
    row.appendChild(createElement('td', '', String(value ?? '—')));
  });

  const actions = document.createElement('td');

  const editLink = createElement('a', 'btn-edit', 'Editar');
  editLink.href = `edit-product.html?id=${encodeURIComponent(product.id)}`;

  const deleteButton = createElement('button', 'btn-delete', 'Eliminar');
  deleteButton.type = 'button';
  deleteButton.dataset.id = product.id;

  actions.append(editLink, deleteButton);
  row.appendChild(actions);
  return row;
}

async function renderProducts() {
  showTableMessage(productsBody, PRODUCT_COLUMNS, 'Cargando productos...');

  try {
    const products = await getProducts();
    if (!Array.isArray(products)) {
      throw new Error('El servidor devolvió una respuesta inesperada.');
    }

    fillCategoryOptions(document.getElementById('category-options'), products);

    if (products.length === 0) {
      showTableMessage(productsBody, PRODUCT_COLUMNS, 'No hay productos registrados.');
      return;
    }

    productsBody.replaceChildren(...products.map(createProductRow));
  } catch (error) {
    console.error('Error al cargar productos:', error);
    showTableError(productsBody, PRODUCT_COLUMNS, 'No pudimos cargar los productos', error.message, renderProducts);
  }
}

productsBody.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('.btn-delete');
  if (!deleteButton) return;

  if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

  try {
    await deleteProduct(deleteButton.dataset.id);
    showToast('Producto eliminado correctamente.');
    await renderProducts();
  } catch (error) {
    showToast(`Error al eliminar: ${error.message}`, 'error');
  }
});

function createSaleRow(order) {
  const row = document.createElement('tr');
  [
    order.id,
    formatSaleDate(order.date),
    order.customer || '—',
    summarizeItems(order.items),
    order.total === null ? '—' : formatColones(order.total)
  ].forEach((value) => row.appendChild(createElement('td', '', String(value))));
  return row;
}

async function renderSales() {
  salesNotice.hidden = true;
  salesSummary.textContent = '';
  showTableMessage(salesBody, SALES_COLUMNS, 'Cargando ventas...');

  let rawOrders;
  let isLocalHistory = false;

  try {
    rawOrders = await getOrders();
  } catch (error) {
    if (error.status === 404 || error.status === 405) {
      rawOrders = getLocalSales();
      isLocalHistory = true;
    } else {
      console.error('Error al cargar las ventas:', error);
      showTableError(salesBody, SALES_COLUMNS, 'No pudimos cargar las ventas', error.message, renderSales);
      return;
    }
  }

  if (isLocalHistory) {
    salesNotice.textContent =
      'El backend no tiene un endpoint de ventas (GET /orders). Se muestran las compras realizadas desde este navegador.';
    salesNotice.hidden = false;
  }

  const orders = sortNewestFirst(rawOrders.map(normalizeOrder));

  if (orders.length === 0) {
    showTableMessage(salesBody, SALES_COLUMNS, 'Aún no hay ventas registradas.');
    return;
  }

  salesBody.replaceChildren(...orders.map(createSaleRow));

  const totalSold = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  salesSummary.textContent = `${orders.length} venta(s) · Total vendido: ${formatColones(totalSold)}`;
}

document.getElementById('refresh-sales-btn').addEventListener('click', renderSales);

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFormMessage(productForm);

  if (!applyFieldErrors(productForm, validateProductForm(productForm))) {
    showFormMessage(productForm, 'Por favor completa todos los campos antes de agregar el producto.');
    return;
  }

  addButton.disabled = true;
  try {
    await createProduct(readProductForm(productForm));

    productForm.reset();
    clearFieldErrors(productForm);
    showFormMessage(productForm, 'Producto agregado correctamente.', 'success');
    await renderProducts();
  } catch (error) {
    showFormMessage(productForm, `Error al guardar el producto: ${error.message}`);
  } finally {
    addButton.disabled = false;
  }
});

function showUpdatedConfirmation() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('updated') !== '1') return;

  showToast('Producto actualizado correctamente.');
  window.history.replaceState({}, '', window.location.pathname);
}

document.addEventListener('DOMContentLoaded', () => {
  showUpdatedConfirmation();
  renderProducts();
  renderSales();
});