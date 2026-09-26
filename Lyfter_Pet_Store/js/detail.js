import { getProductById } from './services/api.js';

// 📝 Rellenar los datos en el HTML
function renderProductDetail(product) {
  document.querySelector('#product-title').textContent = product.name;
  document.querySelector('#product-price').textContent = `$${product.price}`;
  document.querySelector('#product-image').src = product.imageUrl;
  document.querySelector('#product-description').textContent = product.description;
}

// ⚡ Carga inicial de la página de detalle
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  try {
    const product = await getProductById(productId);
    renderProductDetail(product);
  } catch (error) {
    console.error('Error al cargar el detalle:', error);
  }
});

// 📄 Ubicación: js/detail.js
import { getProductById } from './services/api.js';

function renderProductDetail(product) {
  document.querySelector('#product-title').textContent = product.name;
  document.querySelector('#product-price').textContent = `$${product.price}`;
  document.querySelector('#product-image').src = product.imageUrl;
  document.querySelector('#product-description').textContent = product.description;
}

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  // 1. Redirección si no hay ID en la URL
  if (!productId) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const product = await getProductById(productId);
    renderProductDetail(product);
  } catch (error) {
    console.error('Error al cargar el detalle:', error);
    
    // 2. Mensaje en pantalla y redirección tras 3 segundos
    const container = document.querySelector('.product-detail-container');
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <h2>🐾 Producto no encontrado</h2>
          <p>Serás redirigido al catálogo en unos momentos...</p>
          <a href="index.html" class="btn-hero">Volver al catálogo ahora</a>
        </div>
      `;
    }
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 3000);
  }
});