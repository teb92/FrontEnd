export function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart'));
    if (!Array.isArray(cart)) return [];
    return cart.filter((item) => item && item.id !== undefined && Number(item.quantity) >= 1);
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
    existingItem.quantity += Number(quantity);
  } else {
    cart.push({ ...product, quantity: Number(quantity) });
  }

  saveCart(cart);
}

export function getCartQuantity(productId) {
  const item = getCart().find(i => String(i.id) === String(productId));
  return item ? item.quantity : 0;
}

export function hasStockFor(product, quantity = 1) {
  if (product.stock === undefined || product.stock === null) return true;
  return getCartQuantity(product.id) + Number(quantity) <= Number(product.stock);
}

export function updateQuantity(productId, newQuantity) {
  const cart = getCart();
  const item = cart.find(i => String(i.id) === String(productId));
  if (item) {
    item.quantity = Math.max(1, Number(newQuantity));
    saveCart(cart);
  }
}

export function removeFromCart(productId) {
  const cart = getCart().filter(i => String(i.id) !== String(productId));
  saveCart(cart);
}

export function syncCartWithProducts(products) {
  const changes = [];
  const updatedCart = [];

  getCart().forEach((item) => {
    const product = products.find((p) => String(p.id) === String(item.id));
    const name = product ? product.name : item.name;
    const stock = product ? Number(product.stock) : 0;

    if (stock <= 0) {
      changes.push({ type: 'removed', name, quantity: 0 });
      return;
    }
    if (item.quantity > stock) {
      changes.push({ type: 'reduced', name, quantity: stock });
    }
    updatedCart.push({ ...product, quantity: Math.min(item.quantity, stock) });
  });

  saveCart(updatedCart);
  return changes;
}

export function clearCart() {
  localStorage.removeItem('cart');
}

export function getCartCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal() {
  return getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
}
