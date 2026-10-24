export const API_BASE_URL = 'http://127.0.0.1:5000';

const API_KEY = 'mi_clave_secreta_123';

function extractErrorMessage(data) {
  if (!data) return '';
  if (Array.isArray(data.errors)) return data.errors.join(', ');
  return data.message || data.error || '';
}

async function request(path, { method = 'GET', body, auth = false, fallback = 'Ocurrió un error inesperado.' } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) headers['X-API-Key'] = API_KEY;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(extractErrorMessage(data) || fallback);
    error.status = response.status;
    error.data = data; // the full body, e.g. { retry_after } when the server asks the user to wait
    throw error;
  }
  return data;
}

export function getProducts() {
  return request('/products', { fallback: 'Error al obtener los productos' });
}

export async function getProductById(id) {
  const products = await getProducts();
  const product = Array.isArray(products)
    ? products.find((item) => String(item.id) === String(id))
    : null;

  if (!product) {
    const error = new Error('Producto no encontrado');
    error.code = 'NOT_FOUND';
    throw error;
  }
  return product;
}

export function createProduct(productData) {
  return request('/products', { method: 'POST', body: productData, auth: true, fallback: 'Error al crear el producto' });
}

export function updateProduct(id, productData) {
  return request(`/products/${id}`, { method: 'PUT', body: productData, auth: true, fallback: 'Error al actualizar el producto' });
}

export function deleteProduct(id) {
  return request(`/products/${id}`, { method: 'DELETE', auth: true, fallback: 'Error al eliminar el producto' });
}

export function loginUser(email, password) {
  return request('/login', { method: 'POST', body: { email, password }, fallback: 'Correo o contraseña incorrectos' });
}

export function registerUser({ nombre, email, password }) {
  return request('/register', { method: 'POST', body: { nombre, email, password }, fallback: 'Error al registrar usuario' });
}

// Password recovery.
// Asks the backend to email a 6 digit code. The answer is the same whether the email is registered or not.
// Resolves to { message, retry_after } (seconds to wait before asking for another code).
export function requestPasswordReset(email) {
  return request('/forgot-password', { method: 'POST', body: { email }, fallback: 'No se pudo enviar el código' });
}

// Changes the password using the code that was emailed. The server answers 400 if the code is wrong or expired.
export function resetPassword({ email, code, password }) {
  return request('/reset-password', { method: 'POST', body: { email, code, password }, fallback: 'No se pudo cambiar la contraseña' });
}

export async function getOrders() {
  const data = await request('/orders', { auth: true, fallback: 'Error al obtener las ventas' });

  if (Array.isArray(data)) return data;
  const wrapped = data && (data.orders || data.ordenes || data.ventas);
  if (Array.isArray(wrapped)) return wrapped;

  throw new Error('El servidor devolvió una respuesta inesperada.');
}

export function createOrder({ items, customer, userId }) {
  return request('/orders', {
    method: 'POST',
    body: { items, customer, user_id: userId },
    fallback: 'Error al procesar la orden en el servidor.'
  });
}