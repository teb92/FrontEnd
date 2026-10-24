import { getProducts, updateProduct } from './services/api.js';
import { renderLayout } from './layout.js';
import { prepareForm, applyFieldErrors, showFormMessage, clearFormMessage, renderErrorState } from './ui.js';
import { validateProductForm, readProductForm, fillProductForm, fillCategoryOptions } from './product-form.js';
import { createElement } from './utils.js';

const status = document.getElementById('edit-status');
const form = document.getElementById('edit-product-form');
const saveButton = form.querySelector('button[type="submit"]');

function getProductIdFromUrl() {
  const id = new URLSearchParams(window.location.search).get('id');
  return /^\d+$/.test(id ?? '') ? id : null;
}

function showError(message, retry) {
  form.hidden = true;
  renderErrorState(status, { title: 'No pudimos cargar el producto', message, onRetry: retry });

  const backLink = createElement('a', 'btn-secondary', 'Volver a la administración');
  backLink.href = 'admin.html';
  status.querySelector('.error-state').appendChild(backLink);
}

async function loadProduct(productId) {
  form.hidden = true;
  status.innerHTML = '<p class="loading-state" role="status">Cargando producto...</p>';

  try {
    const products = await getProducts();
    if (!Array.isArray(products)) {
      throw new Error('El servidor devolvió una respuesta inesperada.');
    }

    const product = products.find((item) => String(item.id) === productId);
    if (!product) {
      showError('Producto no encontrado');
      return;
    }

    fillCategoryOptions(document.getElementById('category-options'), products);
    fillProductForm(form, product);
    document.title = `Editar ${product.nombre} - PawStore`;

    status.innerHTML = '';
    form.hidden = false;
  } catch (error) {
    console.error('Error al cargar el producto:', error);
    showError(error.message, () => loadProduct(productId));
  }
}

function setupForm(productId) {
  prepareForm(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormMessage(form);

    if (!applyFieldErrors(form, validateProductForm(form))) {
      showFormMessage(form, 'Por favor completa todos los campos antes de guardar los cambios.');
      return;
    }

    saveButton.disabled = true;
    try {
      await updateProduct(productId, readProductForm(form));
      window.location.href = 'admin.html?updated=1';
    } catch (error) {
      showFormMessage(form, `Error al guardar los cambios: ${error.message}`);
      saveButton.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderLayout();

  const productId = getProductIdFromUrl();
  if (!productId) {
    showError('El enlace del producto no es válido.');
    return;
  }

  setupForm(productId);
  loadProduct(productId);
});