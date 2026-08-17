import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getPhoneCountryCallingCode,
  normalizePhoneNumberForCountry,
} from './phone';

describe('country-aware phone input', () => {
  it('normalizes a national number using the selected country', () => {
    assert.equal(normalizePhoneNumberForCountry('07911 123456', 'GB'), '+447911123456');
  });

  it('preserves an already international number', () => {
    assert.equal(normalizePhoneNumberForCountry('+234 803 123 4567', 'GB'), '+2348031234567');
  });

  it('leaves the phone optional', () => {
    assert.equal(normalizePhoneNumberForCountry('  ', 'NG'), '');
  });

  it('provides the calling code for the selector', () => {
    assert.equal(getPhoneCountryCallingCode('GB'), '44');
    assert.equal(getPhoneCountryCallingCode('NG'), '234');
  });
});
