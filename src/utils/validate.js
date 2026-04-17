/* =========================================
   FORM VALIDATION UTILITIES
   ========================================= */

/**
 * Validates a South African ID number (YYMMDDSSSSCAZ).
 * Checks: 13 digits, valid DOB, age >= 18, citizenship digit, Luhn checksum.
 */
export function validateSAID(id) {
  if (!/^\d{13}$/.test(id)) return 'ID number must be exactly 13 digits';

  // Date of birth (digits 1-6)
  const yy = parseInt(id.substring(0, 2), 10);
  const mm = parseInt(id.substring(2, 4), 10);
  const dd = parseInt(id.substring(4, 6), 10);

  const currentYear = new Date().getFullYear() % 100;
  const fullYear = yy > currentYear ? 1900 + yy : 2000 + yy;
  const dob = new Date(fullYear, mm - 1, dd);

  if (dob.getFullYear() !== fullYear || dob.getMonth() !== mm - 1 || dob.getDate() !== dd) {
    return 'ID contains an invalid date of birth';
  }
  if (dob > new Date()) return 'Date of birth cannot be in the future';

  // Age check (must be 18+)
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  if (age < 18) return 'You must be at least 18 years old';

  // Citizenship digit (position 11)
  const citizenship = parseInt(id.charAt(10), 10);
  if (![0, 1, 2].includes(citizenship)) return 'Invalid citizenship digit';

  // Luhn checksum (all 13 digits)
  let sum = 0;
  let alternate = false;
  for (let i = id.length - 1; i >= 0; i--) {
    let n = parseInt(id.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n = (n % 10) + 1;
    }
    sum += n;
    alternate = !alternate;
  }
  if (sum % 10 !== 0) return 'ID number failed checksum validation';

  return '';
}

export function validateEmail(email) {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address';
  return '';
}

export function validatePhone(phone) {
  if (!phone.trim()) return 'Phone number is required';
  const digits = phone.replace(/[\s\-()]/g, '');
  if (!/^\+?\d{10,12}$/.test(digits)) return 'Please enter a valid phone number (10-12 digits)';
  return '';
}

export function validateRequired(value, label) {
  if (!value || !String(value).trim()) return `${label} is required`;
  return '';
}

export function validatePostalCode(code) {
  if (!code.trim()) return 'Postal code is required';
  if (!/^\d{4}$/.test(code.trim())) return 'Postal code must be 4 digits';
  return '';
}

/**
 * Runs all personal-info validations and returns an errors object.
 * Keys match form field names; empty string = no error.
 */
export function validatePersonalInfo(form) {
  return {
    fullName: validateRequired(form.fullName, 'Full name'),
    email: validateEmail(form.email),
    phone: validatePhone(form.phone),
    idNumber: validateSAID(form.idNumber),
    address: validateRequired(form.address, 'Address'),
    city: validateRequired(form.city, 'City'),
    province: validateRequired(form.province, 'Province'),
    postalCode: validatePostalCode(form.postalCode),
  };
}

/** Returns true if there are zero errors. */
export function isValid(errors) {
  return Object.values(errors).every((e) => e === '');
}
