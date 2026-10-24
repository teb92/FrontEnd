export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user && typeof user === 'object' ? user : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}