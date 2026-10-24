import { loginUser } from './services/api.js';
import { renderLayout } from './layout.js';
import { prepareForm, applyFieldErrors, showFormMessage, clearFormMessage } from './ui.js';
import { validateEmail, validatePasswordRequired } from './validators.js';

const loginForm = document.getElementById('login-form');

renderLayout(); // shared header + footer (it used to be an inline script in login.html)

if (loginForm) {
  prepareForm(loginForm);

  // forgot-password.js sends the user here with ?reset=1 after the password was changed
  if (new URLSearchParams(window.location.search).get('reset') === '1') {
    showFormMessage(loginForm, 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.', 'success');
    window.history.replaceState({}, '', window.location.pathname); // so a refresh does not repeat the message
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormMessage(loginForm);

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const isValid = applyFieldErrors(loginForm, {
      email: validateEmail(email),
      password: validatePasswordRequired(password)
    });
    if (!isValid) return;

    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const data = await loginUser(email, password);

      const userData = data.user || {
        nombre: email.split('@')[0],
        email,
        role: data.role || (email === 'admin@pawstore.com' ? 'admin' : 'user')
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));

      const isAdmin = userData.email === 'admin@pawstore.com' || userData.role === 'admin';
      window.location.href = isAdmin ? 'admin.html' : 'index.html';
    } catch (error) {
      showFormMessage(loginForm, error.message);
      submitButton.disabled = false;
    }
  });
}