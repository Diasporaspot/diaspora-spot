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
import { getWorkshopSeriesPricingComparison } from './workshop-series-pricing';

describe('workshop registration input', () => {
  it('normalizes a series registration', () => {
    assert.deepEqual(
      normalizeRegistrationInput({
        email: ' Person@Example.com ',
        name: ' Ada Lovelace ',
        phone: ' +44 7911 123456 ',
        productType: 'series',
        slug: ' career-series ',
        smsMarketingConsent: true,
      }),
      {
        email: 'person@example.com',
        name: 'Ada Lovelace',
        phone: '+447911123456',
        productType: 'series',
        slug: 'career-series',
        smsMarketingConsent: true,
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
        phone: '',
        productType: 'series',
        slug: 'career-series',
        smsMarketingConsent: false,
      }),
      '',
    );
    assert.equal(
      validateRegistrationInput({
        email: 'not-an-email',
        name: 'Ada Lovelace',
        phone: '',
        productType: 'workshop',
        slug: 'cv-review',
        smsMarketingConsent: false,
      }),
      'Enter a valid email address.',
    );
    assert.equal(
      validateRegistrationInput({
        email: 'person@example.com',
        name: 'Ada Lovelace',
        phone: '',
        productType: 'workshop',
        slug: 'cv-review',
        smsMarketingConsent: true,
      }),
      'Enter a phone number to receive SMS updates.',
    );
    assert.equal(
      validateRegistrationInput({
        email: 'person@example.com',
        name: 'Ada Lovelace',
        phone: '07700 900123',
        productType: 'workshop',
        slug: 'cv-review',
        smsMarketingConsent: false,
      }),
      'Enter a valid international phone number including the country code.',
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

  it('compares a discounted series with separately booked workshops', () => {
    assert.deepEqual(
      getWorkshopSeriesPricingComparison({
        currency: 'gbp',
        paymentType: 'paid',
        price: 40,
        pricingConflict: false,
        workshops: [
          { currency: 'gbp', paymentType: 'paid', price: 20 },
          { currency: 'gbp', paymentType: 'paid', price: 20 },
          { currency: 'gbp', paymentType: 'paid', price: 20 },
          { currency: 'gbp', paymentType: 'paid', price: 20 },
        ],
      }),
      {
        individualStartingPrice: { currency: 'gbp', paymentType: 'paid', price: 20 },
        individualTotal: 80,
        perSessionPrice: 10,
        saving: 40,
      },
    );
  });

  it('uses a free workshop as the lowest-commitment starting price', () => {
    const comparison = getWorkshopSeriesPricingComparison({
      currency: 'gbp',
      paymentType: 'paid',
      price: 20,
      pricingConflict: false,
      workshops: [
        { currency: 'gbp', paymentType: 'free', price: 0 },
        { currency: 'gbp', paymentType: 'paid', price: 30 },
      ],
    });

    assert.equal(comparison.individualStartingPrice?.paymentType, 'free');
    assert.equal(comparison.individualTotal, 30);
    assert.equal(comparison.saving, 10);
  });

  it('does not advertise savings across different currencies', () => {
    const comparison = getWorkshopSeriesPricingComparison({
      currency: 'gbp',
      paymentType: 'paid',
      price: 40,
      pricingConflict: false,
      workshops: [
        { currency: 'gbp', paymentType: 'paid', price: 30 },
        { currency: 'usd', paymentType: 'paid', price: 30 },
      ],
    });

    assert.equal(comparison.individualTotal, null);
    assert.equal(comparison.saving, 0);
  });
});
