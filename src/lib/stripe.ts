import Stripe from 'stripe';
import { getSiteEnvironment, type SiteEnvironment } from '@/lib/site-environment';

let stripe: Stripe | null = null;

export function validateStripeKeyForEnvironment(
  secretKey: string,
  environment: SiteEnvironment,
) {
  const isTestKey = secretKey.startsWith('sk_test_');
  const isLiveKey = secretKey.startsWith('sk_live_');

  if (environment === 'staging' && !isTestKey) {
    throw new Error('Staging requires a Stripe test-mode secret key.');
  }

  if (environment === 'production' && !isLiveKey) {
    throw new Error('Production requires a Stripe live-mode secret key.');
  }
}

export function validateStripeEventForEnvironment(
  livemode: boolean,
  environment: SiteEnvironment,
) {
  if (livemode !== (environment === 'production')) {
    throw new Error(`Stripe ${livemode ? 'live' : 'test'} event does not match ${environment}.`);
  }
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  validateStripeKeyForEnvironment(secretKey, getSiteEnvironment());
  stripe ??= new Stripe(secretKey);

  return stripe;
}
