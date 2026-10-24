import { renderLayout } from './layout.js';
import { prepareForm, applyFieldErrors, showFormMessage, clearFormMessage, clearFieldErrors } from './ui.js';
import { validateFullName, validateEmail, validateContactMessage } from './validators.js';

document.addEventListener('DOMContentLoaded', () => {
  renderLayout();

  const contactForm = document.getElementById('contact-form');
  prepareForm(contactForm);

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearFormMessage(contactForm);

    const isValid = applyFieldErrors(contactForm, {
      'contact-name': validateFullName(document.getElementById('contact-name').value),
      'contact-email': validateEmail(document.getElementById('contact-email').value),
      'contact-message': validateContactMessage(document.getElementById('contact-message').value)
    });

    if (!isValid) {
      showFormMessage(contactForm, 'Por favor completa todos los campos correctamente.');
      return;
    }

    contactForm.reset();
    clearFieldErrors(contactForm);
    showFormMessage(contactForm, '¡Gracias por escribirnos! Te responderemos pronto.', 'success');
  });
});