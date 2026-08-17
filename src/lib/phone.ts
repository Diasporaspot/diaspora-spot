import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/core';
import phoneMetadata from 'libphonenumber-js/metadata.min.json';

export type PhoneCountryCode = CountryCode;

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

export function getPhoneCountries() {
  return getCountries(phoneMetadata);
}

export function getPhoneCountryCallingCode(country: PhoneCountryCode) {
  return getCountryCallingCode(country, phoneMetadata);
}

export function normalizePhoneNumberForCountry(
  value: unknown,
  country: PhoneCountryCode,
) {
  const phone = typeof value === 'string' ? value.trim() : '';

  if (!phone) {
    return '';
  }

  const parsedPhone = parsePhoneNumberFromString(phone, country, phoneMetadata);
  return parsedPhone?.number || phone;
}

export function isValidInternationalPhoneNumber(phone: string) {
  return Boolean(phone && parseInternationalPhoneNumber(phone)?.isValid());
}
