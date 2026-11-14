import { registerUser } from './services/api.js';
import { renderLayout } from './layout.js';
import { prepareForm, applyFieldErrors, showFormMessage, clearFormMessage } from './ui.js';
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation
} from './validators.js';

const registerForm = document.getElementById('register-form');

renderLayout();

if (registerForm) {
  prepareForm(registerForm);

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormMessage(registerForm);

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmation = document.getElementById('confirm-password').value;

    const isValid = applyFieldErrors(registerForm, {
      name: validateFullName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      'confirm-password': validatePasswordConfirmation(password, confirmation)
    });
    if (!isValid) {
      showFormMessage(registerForm, 'Por favor completa todos los campos correctamente.');
      return;
    }

    const submitButton = registerForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      await registerUser({ name, email, password });
      showFormMessage(registerForm, 'Registro exitoso. Redirigiendo al inicio de sesión...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } catch (error) {
      showFormMessage(registerForm, error.message);
      submitButton.disabled = false;
    }
  });
}
