export function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart'));
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

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

export function getCartQuantity(productId) {
  const item = getCart().find(i => String(i.id) === String(productId));
  return item ? Number(item.cantidad || item.quantity || 0) : 0;
}

export function hasStockFor(product, quantity = 1) {
  if (product.stock === undefined || product.stock === null) return true;
  return getCartQuantity(product.id) + Number(quantity) <= Number(product.stock);
}

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

export function removeFromCart(productId) {
  const cart = getCart().filter(i => String(i.id) !== String(productId));
  saveCart(cart);
}

export function clearCart() {
  localStorage.removeItem('cart');
}

export function getCartCount() {
  return getCart().reduce((total, item) => {
    const qty = Number(item.cantidad || item.quantity || 1);
    return total + qty;
  }, 0);
}

export function getCartTotal() {
  return getCart().reduce((total, item) => {
    const price = Number(item.precio || item.price || 0);
    const qty = Number(item.cantidad || item.quantity || 1);
    return total + (price * qty);
  }, 0);
}