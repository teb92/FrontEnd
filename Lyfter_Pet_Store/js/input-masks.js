const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '');

export function formatCardNumber(value) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value, { deleting = false } = {}) {
  let digits = onlyDigits(value).slice(0, 4);
  if (digits === '') return '';

  if (digits[0] > '1') digits = `0${digits}`;

  let month = digits.slice(0, 2);
  let year = digits.slice(2);

  if (month.length === 2) {
    const monthNumber = Number(month);
    if (monthNumber === 0) {
      month = '0';
      year = '';
    } else if (monthNumber > 12) {
      year = month[1] + year;
      month = `0${month[0]}`;
    }
  }

  year = year.slice(0, 2);

  if (month.length < 2) return month;
  if (year === '') return deleting ? month : `${month}/`;
  return `${month}/${year}`;
}

export function formatCvv(value) {
  return onlyDigits(value).slice(0, 4);
}

// Verification code of the password recovery: digits only, up to 6
export function formatVerificationCode(value) {
  return onlyDigits(value).slice(0, 6);
}

const countDigits = (text) => (text.match(/\d/g) || []).length;

export function attachInputMask(input, format, attributes = {}) {
  if (!input) return;

  Object.entries(attributes).forEach(([name, value]) => input.setAttribute(name, value));

  input.addEventListener('input', (event) => {
    const deleting = Boolean(event.inputType && event.inputType.startsWith('delete'));
    const rawValue = input.value;
    const caret = input.selectionStart ?? rawValue.length;
    const typedAtEnd = caret >= rawValue.length;

    const formatted = format(rawValue, { deleting });
    if (formatted === rawValue) return;

    input.value = formatted;

    let newCaret = formatted.length;
    if (!typedAtEnd) {
      const digitsBeforeCaret = countDigits(rawValue.slice(0, caret));
      let seen = 0;
      newCaret = 0;
      while (newCaret < formatted.length && seen < digitsBeforeCaret) {
        if (/\d/.test(formatted[newCaret])) seen += 1;
        newCaret += 1;
      }
    }
    input.setSelectionRange(newCaret, newCaret);
  });
}