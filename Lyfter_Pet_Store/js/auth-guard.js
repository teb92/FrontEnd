import { getProfile } from './services/api.js';
import { isAdmin, getToken, saveSession } from './session.js';
import { renderErrorState } from './ui.js';

async function guardAdminPage() {
  if (!isAdmin()) {
    window.location.replace('login.html');
    return;
  }

  try {
    const user = await getProfile();
    saveSession(user, getToken());
  } catch (error) {
    if (error.status !== 401) {
      showVerificationError(error);
      return;
    }
  }

  if (!isAdmin()) {
    window.location.replace('login.html');
    return;
  }

  document.documentElement.classList.remove('auth-pending');
}

function showVerificationError(error) {
  renderErrorState(document.querySelector('main'), {
    title: 'No pudimos verificar tu sesión',
    message: error.message,
    onRetry: () => window.location.reload()
  });
  document.documentElement.classList.remove('auth-pending');
}

guardAdminPage();
