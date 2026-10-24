import { registerUser } from './services/api.js';
import { prepareForm, applyFieldErrors, showFormMessage, clearFormMessage } from './ui.js';
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation
} from './validators.js';

const registerForm = document.getElementById('register-form');

if (registerForm) {
  prepareForm(registerForm);

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormMessage(registerForm);

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmation = document.getElementById('confirm-password').value;

    const isValid = applyFieldErrors(registerForm, {
      nombre: validateFullName(nombre),
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
      await registerUser({ nombre, email, password });
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