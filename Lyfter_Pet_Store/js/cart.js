// 1. Obtener los productos guardados en localStorage
export function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// 2. Guardar el estado actualizado del carrito
export function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// 3. Agregar un producto al carrito
export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(item => String(item.id) === String(product.id));

  if (existingItem) {
    const currentQty = Number(existingItem.cantidad || existingItem.quantity || 0);
    const addQty = Number(quantity);
    if (existingItem.cantidad !== undefined) {
      existingItem.cantidad = currentQty + addQty;
    } else {
      existingItem.quantity = currentQty + addQty;
    }
  } else {
    cart.push({ ...product, cantidad: Number(quantity) });
  }

  saveCart(cart);
}

// 4. Actualizar la cantidad de un producto específico
export function updateQuantity(productId, newQuantity) {
  const cart = getCart();
  const item = cart.find(i => String(i.id) === String(productId));
  if (item) {
    const validQty = Math.max(1, Number(newQuantity));
    if (item.cantidad !== undefined) {
      item.cantidad = validQty;
    } else {
      item.quantity = validQty;
    }
    saveCart(cart);
  }
}

// 5. Eliminar un producto del carrito
export function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(i => String(i.id) !== String(productId));
  saveCart(cart);
}

// 🧹 6. Vaciar el carrito por completo
export function clearCart() {
  localStorage.removeItem('cart');
}

// 7. Total de unidades para la barra de navegación (layout.js)
export function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => {
    const qty = Number(item.cantidad || item.quantity || 1);
    return total + qty;
  }, 0);
}

// 8. Suma total del monto para la barra de navegación (layout.js)
export function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => {
    const price = Number(item.precio || item.price || 0);
    const qty = Number(item.cantidad || item.quantity || 1);
    return total + (price * qty);
  }, 0);
}