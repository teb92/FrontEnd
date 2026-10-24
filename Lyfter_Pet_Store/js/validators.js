export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
export const FULL_NAME_REGEX = /^\p{L}[\p{L}'’.-]*(?:\s+\p{L}[\p{L}'’.-]*)+$/u;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;
export const PHONE_REGEX = /^(?:\+?506[\s-]?)?[2-8]\d{3}[\s-]?\d{4}$/;
export const CARD_NUMBER_REGEX = /^\d{4}([ -]?)\d{4}\1\d{4}\1\d{4}$/;
export const CARD_EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/(\d{2})$/;
export const CARD_CVV_REGEX = /^\d{3,4}$/;
export const CATEGORY_REGEX = /^[\p{L}\s]{3,30}$/u;
export const PRICE_REGEX = /^\d+(?:\.\d{1,2})?$/;
export const INTEGER_REGEX = /^\d+$/;
export const URL_REGEX = /^https?:\/\/[^\s/$.?#][^\s]*$/i;

const REQUIRED_MESSAGE = 'Este campo es obligatorio.';

const clean = (value) => String(value ?? '').trim();

export function validateEmail(value) {
  const email = clean(value);
  if (!email) return REQUIRED_MESSAGE;
  if (!EMAIL_REGEX.test(email)) return 'Ingresa un correo válido, por ejemplo nombre@dominio.com.';
  return null;
}

export function validateFullName(value) {
  const name = clean(value);
  if (!name) return REQUIRED_MESSAGE;
  if (name.length < 5) return 'El nombre debe tener al menos 5 caracteres.';
  if (name.length > 60) return 'El nombre no puede superar los 60 caracteres.';
  if (!FULL_NAME_REGEX.test(name)) return 'Ingresa tu nombre y apellido (solo letras).';
  return null;
}

export function validatePasswordRequired(value) {
  return String(value ?? '') ? null : REQUIRED_MESSAGE;
}

export function validatePassword(value) {
  const password = String(value ?? '');
  if (!password) return REQUIRED_MESSAGE;
  if (!PASSWORD_REGEX.test(password)) {
    return 'La contraseña debe tener entre 8 y 64 caracteres, con mayúscula, minúscula y número.';
  }
  return null;
}

export function validatePasswordConfirmation(password, confirmation) {
  if (!String(confirmation ?? '')) return REQUIRED_MESSAGE;
  if (password !== confirmation) return 'Las contraseñas no coinciden.';
  return null;
}

export function validateAddress(value) {
  const address = clean(value);
  if (!address) return REQUIRED_MESSAGE;
  if (address.length < 10) return 'La dirección debe tener al menos 10 caracteres.';
  if (address.length > 200) return 'La dirección no puede superar los 200 caracteres.';
  return null;
}

export function validatePhone(value) {
  const phone = clean(value);
  if (!phone) return REQUIRED_MESSAGE;
  if (!PHONE_REGEX.test(phone)) return 'Ingresa un teléfono de Costa Rica de 8 dígitos, por ejemplo 8888-8888.';
  return null;
}

export function validateCardNumber(value) {
  const card = clean(value);
  if (!card) return REQUIRED_MESSAGE;
  if (!CARD_NUMBER_REGEX.test(card)) return 'El número de tarjeta debe tener 16 dígitos.';
  return null;
}

export function validateCardExpiry(value, now = new Date()) {
  const expiry = clean(value);
  if (!expiry) return REQUIRED_MESSAGE;

  const match = CARD_EXPIRY_REGEX.exec(expiry);
  if (!match) return 'Usa el formato MM/AA, por ejemplo 08/28.';

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const lastValidMoment = new Date(year, month, 0, 23, 59, 59);
  if (lastValidMoment < now) return 'La tarjeta está vencida.';
  return null;
}

export function validateCardCvv(value) {
  const cvv = clean(value);
  if (!cvv) return REQUIRED_MESSAGE;
  if (!CARD_CVV_REGEX.test(cvv)) return 'El CVV debe tener 3 o 4 dígitos.';
  return null;
}

export function validateProductName(value) {
  const name = clean(value);
  if (!name) return REQUIRED_MESSAGE;
  if (name.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  if (name.length > 80) return 'El nombre no puede superar los 80 caracteres.';
  return null;
}

export function validateProductDescription(value) {
  const description = clean(value);
  if (!description) return REQUIRED_MESSAGE;
  if (description.length < 10) return 'La descripción debe tener al menos 10 caracteres.';
  if (description.length > 500) return 'La descripción no puede superar los 500 caracteres.';
  return null;
}

export function validateProductPrice(value) {
  const price = clean(value);
  if (!price) return REQUIRED_MESSAGE;
  if (!PRICE_REGEX.test(price)) return 'El precio debe ser un número con máximo 2 decimales.';
  if (Number(price) <= 0) return 'El precio debe ser mayor que 0.';
  return null;
}

export function validateProductCategory(value) {
  const category = clean(value);
  if (!category) return REQUIRED_MESSAGE;
  if (!CATEGORY_REGEX.test(category)) return 'La categoría debe tener entre 3 y 30 letras.';
  return null;
}

export function validateImageUrl(value) {
  const url = clean(value);
  if (!url) return REQUIRED_MESSAGE;
  if (!URL_REGEX.test(url)) return 'Ingresa una URL válida que empiece con http:// o https://.';
  return null;
}

export function validateProductStock(value) {
  const stock = clean(value);
  if (!stock) return REQUIRED_MESSAGE;
  if (!INTEGER_REGEX.test(stock)) return 'El stock debe ser un número entero mayor o igual a 0.';
  if (Number(stock) > 100000) return 'El stock no puede superar las 100000 unidades.';
  return null;
}

export function validateContactMessage(value) {
  const message = clean(value);
  if (!message) return REQUIRED_MESSAGE;
  if (message.length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
  if (message.length > 500) return 'El mensaje no puede superar los 500 caracteres.';
  return null;
}

// ---------- Password recovery ----------
// The verification code that arrives by email: exactly 6 digits
export function validateResetCode(value) {
  const code = clean(value);
  if (!code) return REQUIRED_MESSAGE;
  if (!/^\d{6}$/.test(code)) return 'El código debe tener 6 dígitos.';
  return null;
}