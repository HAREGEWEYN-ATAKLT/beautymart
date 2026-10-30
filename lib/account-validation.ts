const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-\s]+$/;

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email: string) {
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

export function isValidPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

export function isValidFullName(value: unknown) {
  const name = typeof value === "string" ? value.trim() : "";
  return name.length >= 2 && name.length <= 100;
}

export function isValidPhone(value: unknown) {
  const phone = typeof value === "string" ? value.trim() : "";
  return phone.length >= 7 && phone.length <= 30 && PHONE_PATTERN.test(phone);
}
