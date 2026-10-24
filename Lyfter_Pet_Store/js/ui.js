const INVALID_CLASS = 'input-invalid';

export function prepareForm(form) {
  form.noValidate = true;
  form.addEventListener('input', (event) => clearFieldError(event.target));
}

export function clearFieldError(input) {
  if (!input || !input.classList) return;
  input.classList.remove(INVALID_CLASS);
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
  if (input.id) document.getElementById(`${input.id}-error`)?.remove();
}

export function clearFieldErrors(form) {
  form.querySelectorAll(`.${INVALID_CLASS}`).forEach(clearFieldError);
}

function setFieldError(input, message) {
  clearFieldError(input);
  input.classList.add(INVALID_CLASS);
  input.setAttribute('aria-invalid', 'true');

  const error = document.createElement('small');
  error.className = 'field-error';
  error.id = `${input.id}-error`;
  error.textContent = message;

  input.setAttribute('aria-describedby', error.id);
  input.insertAdjacentElement('afterend', error);
}

export function applyFieldErrors(form, errors) {
  let firstInvalid = null;

  Object.entries(errors).forEach(([inputId, message]) => {
    const input = form.querySelector(`#${inputId}`);
    if (!input) return;

    if (message) {
      setFieldError(input, message);
      if (!firstInvalid) firstInvalid = input;
    } else {
      clearFieldError(input);
    }
  });

  if (firstInvalid) firstInvalid.focus();
  return firstInvalid === null;
}

export function showFormMessage(form, text, type = 'error') {
  let box = form.querySelector('.form-message');
  if (!box) {
    box = document.createElement('p');
    form.prepend(box);
  }

  box.className = `form-message form-message--${type}`;
  box.setAttribute('role', type === 'error' ? 'alert' : 'status');
  box.textContent = text;
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function clearFormMessage(form) {
  const box = form.querySelector('.form-message');
  if (!box) return;
  box.className = 'form-message';
  box.textContent = '';
}

export function showToast(message, type = 'success', duration = 3500) {
  let region = document.getElementById('toast-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'toast-region';
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  if (type === 'error') toast.setAttribute('role', 'alert');
  toast.textContent = message;

  region.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

export function renderErrorState(container, { title, message, onRetry }) {
  container.innerHTML = '';

  const box = document.createElement('div');
  box.className = 'error-state';
  box.setAttribute('role', 'alert');

  const heading = document.createElement('p');
  heading.className = 'error-state-title';
  heading.textContent = title;

  const detail = document.createElement('small');
  detail.textContent = message;

  box.append(heading, detail);

  if (onRetry) {
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'btn-primary';
    retryButton.textContent = 'Reintentar';
    retryButton.addEventListener('click', onRetry);
    box.appendChild(retryButton);
  }

  container.appendChild(box);
}

export function renderLoginRequired(container) {
  container.innerHTML = `
    <section class="login-required" aria-labelledby="login-required-title">
      <div class="login-required-icon" aria-hidden="true">🔒</div>
      <h1 id="login-required-title">Debes iniciar sesión para continuar</h1>
      <p>Protege tus compras y gestiona tu perfil con facilidad.</p>
      <a href="login.html" class="btn-primary">Ir a iniciar sesión</a>
    </section>
  `;
}