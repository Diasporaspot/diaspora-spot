import { isValidEmail } from '@/lib/mailerlite';
import {
  isValidInternationalPhoneNumber,
  normalizeInternationalPhoneNumber,
} from '@/lib/phone';

export type WorkshopPaymentType = 'free' | 'paid';
export type RegistrationProductType = 'series' | 'workshop';

export type RegistrationInput = {
  email: string;
  name: string;
  phone: string;
  productType: RegistrationProductType;
  slug: string;
  smsMarketingConsent: boolean;
};

type PricedProduct = {
  currency?: string;
  paymentType?: WorkshopPaymentType;
  price?: number;
};

type SeriesPricedProduct = Pick<PricedProduct, 'paymentType'> & {
  workshops?: Array<Pick<PricedProduct, 'paymentType'>>;
};

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'ugx',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
]);

export function normalizeRegistrationInput(input: {
  email?: unknown;
  name?: unknown;
  phone?: unknown;
  productType?: unknown;
  slug?: unknown;
  smsMarketingConsent?: unknown;
}): RegistrationInput {
  return {
    email: typeof input.email === 'string' ? input.email.trim().toLowerCase() : '',
    name: typeof input.name === 'string' ? input.name.trim() : '',
    phone: normalizeInternationalPhoneNumber(input.phone),
    productType: input.productType === 'series' ? 'series' : 'workshop',
    slug: typeof input.slug === 'string' ? input.slug.trim() : '',
    smsMarketingConsent: input.smsMarketingConsent === true,
  };
}

export function validateRegistrationInput({
  email,
  name,
  phone,
  slug,
  smsMarketingConsent,
}: RegistrationInput) {
  if (!name || name.length > 120) {
    return 'Enter your name.';
  }

  if (!isValidEmail(email)) {
    return 'Enter a valid email address.';
  }

  if (phone && !isValidInternationalPhoneNumber(phone)) {
    return 'Enter a valid international phone number including the country code.';
  }

  if (smsMarketingConsent && !phone) {
    return 'Enter a phone number to receive SMS updates.';
  }

  if (!slug) {
    return 'Select a workshop or series.';
  }

  return '';
}

export function isPaidProduct(product: PricedProduct) {
  return product.paymentType === 'paid' && typeof product.price === 'number' && product.price > 0;
}

export function hasSeriesPricingConflict(product: SeriesPricedProduct) {
  return (
    product.paymentType !== 'paid' &&
    Boolean(product.workshops?.some((workshop) => workshop.paymentType === 'paid'))
  );
}

export function getProductCurrency(product: Pick<PricedProduct, 'currency'>) {
  return (product.currency || 'usd').trim().toLowerCase();
}

export function getStripeUnitAmount(product: Pick<PricedProduct, 'currency' | 'price'>) {
  if (typeof product.price !== 'number' || product.price <= 0) {
    return 0;
  }

  const currency = getProductCurrency(product);
  const multiplier = ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;

  return Math.round(product.price * multiplier);
}
