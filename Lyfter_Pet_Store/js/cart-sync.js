import { getProducts } from './services/api.js';
import { syncCartWithProducts } from './cart.js';
import { showToast } from './ui.js';

export async function refreshCart() {
  let products;
  try {
    products = await getProducts();
  } catch {
    return;
  }

  syncCartWithProducts(products).forEach((change) => {
    const message = change.type === 'removed'
      ? `"${change.name}" ya no está disponible y se quitó de tu carrito.`
      : `Solo quedan ${change.quantity} unidad(es) de "${change.name}"; ajustamos tu carrito.`;
    showToast(message, 'error', 6000);
  });
}
