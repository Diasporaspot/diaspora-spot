import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getProductCurrency,
  getStripeUnitAmount,
  hasSeriesPricingConflict,
  isPaidProduct,
  normalizeRegistrationInput,
  validateRegistrationInput,
} from './workshop-registration-core';

describe('workshop registration input', () => {
  it('normalizes a series registration', () => {
    assert.deepEqual(
      normalizeRegistrationInput({
        email: ' Person@Example.com ',
        name: ' Ada Lovelace ',
        productType: 'series',
        slug: ' career-series ',
      }),
      {
        email: 'person@example.com',
        name: 'Ada Lovelace',
        productType: 'series',
        slug: 'career-series',
      },
    );
  });

  it('defaults unknown product types to an individual workshop', () => {
    assert.equal(normalizeRegistrationInput({ productType: 'bundle' }).productType, 'workshop');
  });

  it('validates the required registration fields', () => {
    assert.equal(
      validateRegistrationInput({
        email: 'person@example.com',
        name: 'Ada Lovelace',
        productType: 'series',
        slug: 'career-series',
      }),
      '',
    );
    assert.equal(
      validateRegistrationInput({
        email: 'not-an-email',
        name: 'Ada Lovelace',
        productType: 'workshop',
        slug: 'cv-review',
      }),
      'Enter a valid email address.',
    );
  });
});

describe('workshop and series pricing', () => {
  it('converts ordinary and zero-decimal currencies for Stripe', () => {
    assert.equal(getStripeUnitAmount({ currency: 'usd', price: 25.5 }), 2550);
    assert.equal(getStripeUnitAmount({ currency: 'jpy', price: 2500 }), 2500);
  });

  it('rejects non-positive paid prices and normalizes currency', () => {
    assert.equal(isPaidProduct({ paymentType: 'paid', price: 0 }), false);
    assert.equal(isPaidProduct({ paymentType: 'paid', price: 25 }), true);
    assert.equal(getProductCurrency({ currency: ' GBP ' }), 'gbp');
  });

  it('rejects a free series that contains a paid workshop', () => {
    assert.equal(
      hasSeriesPricingConflict({
        paymentType: 'free',
        workshops: [{ paymentType: 'free' }, { paymentType: 'paid' }],
      }),
      true,
    );
    assert.equal(
      hasSeriesPricingConflict({
        paymentType: 'paid',
        workshops: [{ paymentType: 'free' }, { paymentType: 'paid' }],
      }),
      false,
    );
  });
});
