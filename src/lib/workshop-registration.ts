import { isValidEmail, subscribeToMailerLite } from '@/lib/mailerlite';
import { sanityClient } from '@/sanity/lib/client';

export type WorkshopPaymentType = 'free' | 'paid';

export type RegistrationInput = {
  email: string;
  name: string;
  slug: string;
};

export type RegistrationWorkshop = {
  _id: string;
  bookingStatus?: string;
  currency?: string;
  mailerLiteGroupId?: string;
  mailerLiteProvisioningStatus?: string;
  paymentType?: WorkshopPaymentType;
  price?: number;
  title?: string;
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
  slug?: unknown;
}) {
  return {
    email: typeof input.email === 'string' ? input.email.trim().toLowerCase() : '',
    name: typeof input.name === 'string' ? input.name.trim() : '',
    slug: typeof input.slug === 'string' ? input.slug.trim() : '',
  };
}

export function validateRegistrationInput({ email, name, slug }: RegistrationInput) {
  if (!name || name.length > 120) {
    return 'Enter your name.';
  }

  if (!isValidEmail(email)) {
    return 'Enter a valid email address.';
  }

  if (!slug) {
    return 'Select a workshop.';
  }

  return '';
}

export function isPaidWorkshop(workshop: Pick<RegistrationWorkshop, 'paymentType' | 'price'>) {
  return workshop.paymentType === 'paid' && typeof workshop.price === 'number' && workshop.price > 0;
}

export function getWorkshopCurrency(workshop: Pick<RegistrationWorkshop, 'currency'>) {
  return (workshop.currency || 'usd').trim().toLowerCase();
}

export function getStripeUnitAmount(workshop: Pick<RegistrationWorkshop, 'currency' | 'price'>) {
  if (typeof workshop.price !== 'number' || workshop.price <= 0) {
    return 0;
  }

  const currency = getWorkshopCurrency(workshop);
  const multiplier = ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;

  return Math.round(workshop.price * multiplier);
}

export async function getRegistrationWorkshop(slug: string) {
  return sanityClient.fetch<RegistrationWorkshop | null>(
    `*[_type == "workshop" && status == "published" && slug.current == $slug][0]{
      _id,
      bookingStatus,
      currency,
      mailerLiteGroupId,
      mailerLiteProvisioningStatus,
      paymentType,
      price,
      title
    }`,
    { slug },
  );
}

export async function getWorkshopForPaidFulfillment(id: string) {
  return sanityClient.fetch<RegistrationWorkshop | null>(
    `*[_type == "workshop" && _id == $id][0]{
      _id,
      bookingStatus,
      currency,
      mailerLiteGroupId,
      mailerLiteProvisioningStatus,
      paymentType,
      price,
      title
    }`,
    { id },
  );
}

export function getWorkshopRegistrationError(workshop: RegistrationWorkshop | null) {
  if (!workshop) {
    return { message: 'This workshop could not be found.', status: 404 };
  }

  if (!workshop.mailerLiteGroupId || workshop.mailerLiteProvisioningStatus !== 'ready') {
    return {
      message: 'Registration is not available for this workshop yet.',
      status: 409,
    };
  }

  return null;
}

export async function registerWorkshopAttendee({
  email,
  name,
  workshop,
}: {
  email: string;
  name: string;
  workshop: RegistrationWorkshop;
}) {
  if (!workshop.mailerLiteGroupId) {
    throw new Error('Workshop registration group is missing.');
  }

  await subscribeToMailerLite({
    email,
    name,
    groupIds: [workshop.mailerLiteGroupId],
  });
}
