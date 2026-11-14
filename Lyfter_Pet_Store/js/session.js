const USER_KEY = 'currentUser';
const TOKEN_KEY = 'authToken';

export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    return user && typeof user === 'object' ? user : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}

export function isAdmin() {
  const user = getCurrentUser();
  return user !== null && user.role === 'admin';
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession(user, token) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
