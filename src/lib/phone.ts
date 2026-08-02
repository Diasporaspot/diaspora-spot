import { parsePhoneNumberFromString } from 'libphonenumber-js/core';
import phoneMetadata from 'libphonenumber-js/metadata.min.json';

function parseInternationalPhoneNumber(phone: string) {
  return parsePhoneNumberFromString(phone, {}, phoneMetadata);
}

export function normalizeInternationalPhoneNumber(value: unknown) {
  const phone = typeof value === 'string' ? value.trim() : '';

  if (!phone) {
    return '';
  }

  const parsedPhone = parseInternationalPhoneNumber(phone);
  return parsedPhone?.isValid() ? parsedPhone.number : phone;
}

export function isValidInternationalPhoneNumber(phone: string) {
  return Boolean(phone && parseInternationalPhoneNumber(phone)?.isValid());
}
