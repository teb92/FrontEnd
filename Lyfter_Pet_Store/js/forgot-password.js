import { requestPasswordReset, resetPassword } from './services/api.js';
import { renderLayout } from './layout.js';
import { prepareForm, applyFieldErrors, showFormMessage, clearFormMessage, showToast } from './ui.js';
import { validateEmail, validateResetCode, validatePassword, validatePasswordConfirmation } from './validators.js';
import { attachInputMask, formatVerificationCode } from './input-masks.js';

const DEFAULT_RESEND_SECONDS = 60;

const stepEmail = document.getElementById('step-email');
const stepReset = document.getElementById('step-reset');
const emailForm = document.getElementById('email-form');
const resetForm = document.getElementById('reset-form');
const resendButton = document.getElementById('resend-btn');

let countdownTimer = null;

renderLayout();
prepareForm(emailForm);
prepareForm(resetForm);

attachInputMask(document.getElementById('code'), formatVerificationCode, {
  inputmode: 'numeric',
  autocomplete: 'one-time-code'
});

function showStep(step) {
  stepEmail.hidden = step !== 'email';
  stepReset.hidden = step !== 'reset';

  const emailField = document.getElementById('reset-email');
  const firstField = step === 'email'
    ? document.getElementById('email')
    : (emailField.value ? document.getElementById('code') : emailField);
  firstField.focus();
}

function startCountdown(seconds) {
  clearInterval(countdownTimer);
  let remaining = seconds;

  const render = () => {
    if (remaining > 0) {
      resendButton.disabled = true;
      resendButton.textContent = `Reenviar código (${remaining} s)`;
    } else {
      resendButton.disabled = false;
      resendButton.textContent = 'Reenviar código';
      clearInterval(countdownTimer);
    }
  };

  render();
  countdownTimer = setInterval(() => {
    remaining -= 1;
    render();
  }, 1000);
}

async function sendCode(email) {
  const data = await requestPasswordReset(email);
  startCountdown(data?.retry_after || DEFAULT_RESEND_SECONDS);
  return data;
}

emailForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFormMessage(emailForm);

  const email = document.getElementById('email').value.trim();
  if (!applyFieldErrors(emailForm, { email: validateEmail(email) })) return;

  const submitButton = emailForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    await sendCode(email);
    document.getElementById('reset-email').value = email;
    showStep('reset');
    showFormMessage(resetForm, 'Si el correo está registrado, te enviamos un código de 6 dígitos. Vence en 10 minutos.', 'success');
  } catch (error) {
    showFormMessage(emailForm, error.message);
  } finally {
    submitButton.disabled = false;
  }
});

document.getElementById('have-code-btn').addEventListener('click', () => {
  const typedEmail = document.getElementById('email').value.trim();
  if (typedEmail) document.getElementById('reset-email').value = typedEmail;
  clearFormMessage(emailForm);
  showStep('reset');
});

document.getElementById('change-email-btn').addEventListener('click', () => {
  clearFormMessage(resetForm);
  showStep('email');
});

resendButton.addEventListener('click', async () => {
  clearFormMessage(resetForm);

  const email = document.getElementById('reset-email').value.trim();
  if (!applyFieldErrors(resetForm, { 'reset-email': validateEmail(email) })) return;

  resendButton.disabled = true;
  try {
    await sendCode(email);
    showToast('Te enviamos un nuevo código. El anterior ya no sirve.');
  } catch (error) {
    showFormMessage(resetForm, error.message);
    if (error.status === 429 && error.data?.retry_after) {
      startCountdown(error.data.retry_after);
    } else {
      resendButton.disabled = false;
    }
  }
});

resetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFormMessage(resetForm);

  const email = document.getElementById('reset-email').value.trim();
  const code = document.getElementById('code').value.trim();
  const password = document.getElementById('new-password').value;
  const confirmation = document.getElementById('confirm-password').value;

  const isValid = applyFieldErrors(resetForm, {
    'reset-email': validateEmail(email),
    code: validateResetCode(code),
    'new-password': validatePassword(password),
    'confirm-password': validatePasswordConfirmation(password, confirmation)
  });
  if (!isValid) {
    showFormMessage(resetForm, 'Por favor completa todos los campos correctamente.');
    return;
  }

  const submitButton = resetForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    await resetPassword({ email, code, password });
    clearInterval(countdownTimer);
    showFormMessage(resetForm, 'Contraseña actualizada. Redirigiendo al inicio de sesión...', 'success');
    setTimeout(() => {
      window.location.href = 'login.html?reset=1';
    }, 1500);
  } catch (error) {
    showFormMessage(resetForm, error.message);
    submitButton.disabled = false;
  }
});
