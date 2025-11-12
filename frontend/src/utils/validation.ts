// Email validation regex
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports various formats: +1234567890, 123-456-7890, (123) 456-7890, 1234567890, etc.)
export const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

// Password validation (minimum 6 characters)
export const passwordRegex = /^.{6,}$/;

export function validateEmail(email: string): boolean {
  if (!email) return true; // Empty is valid if not required
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true; // Empty is valid if not required
  return phoneRegex.test(phone);
}

export function validatePassword(password: string): boolean {
  if (!password) return true; // Empty is valid if not required
  return passwordRegex.test(password);
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function getEmailError(email: string, required: boolean = false): string | null {
  if (!email && !required) return null;
  if (!email && required) return "Email is required";
  if (!validateEmail(email)) return "Please enter a valid email address";
  return null;
}

export function getPhoneError(phone: string, required: boolean = false): string | null {
  if (!phone && !required) return null;
  if (!phone && required) return "Phone number is required";
  if (!validatePhone(phone)) return "Please enter a valid phone number";
  return null;
}

export function getPasswordError(password: string, required: boolean = false): string | null {
  if (!password && !required) return null;
  if (!password && required) return "Password is required";
  if (!validatePassword(password)) return "Password must be at least 6 characters";
  return null;
}

export function getRequiredError(value: string, fieldName: string): string | null {
  if (!validateRequired(value)) return `${fieldName} is required`;
  return null;
}

