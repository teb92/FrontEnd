import { renderLayout } from './layout.js';
import { isLoggedIn } from './session.js';

document.addEventListener('DOMContentLoaded', () => {
  renderLayout();

  if (isLoggedIn()) {
    document.querySelectorAll('[data-guest-only]').forEach((element) => {
      element.hidden = true;
    });
  }
});