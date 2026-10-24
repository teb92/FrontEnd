document.addEventListener('DOMContentLoaded', () => {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('currentUser'));
  } catch {
    user = null;
  }

  const isAdmin =
    user &&
    (user.role === 'admin' ||
      user.rol === 'admin' ||
      user.email === 'admin@pawstore.com');

  if (!isAdmin) {
    window.location.replace('login.html');
  }
});