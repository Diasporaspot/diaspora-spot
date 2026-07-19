import {
  getProductCurrency,
  getProductRegistrationError,
  getRegistrationProduct,
  getStripeUnitAmount,
  isPaidProduct,
  normalizeRegistrationInput,
  validateRegistrationInput,
} from '@/lib/workshop-registration';
import { getStripe } from '@/lib/stripe';

type CheckoutBody = {
  email?: unknown;
  name?: unknown;
  productType?: unknown;
  slug?: unknown;
  website?: unknown;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

function isRateLimited(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const key = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recentAttempts = (attempts.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  recentAttempts.push(now);
  attempts.set(key, recentAttempts);
  return recentAttempts.length > RATE_LIMIT_MAX_ATTEMPTS;
}

function getBaseUrl(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return Response.json(
      { error: 'Too many payment attempts. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as CheckoutBody;
    const input = normalizeRegistrationInput(body);
    const website = typeof body.website === 'string' ? body.website.trim() : '';

    if (website) {
      return Response.json({ ok: true });
    }

    const validationError = validateRegistrationInput(input);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const product = await getRegistrationProduct(input.productType, input.slug);
    const registrationError = getProductRegistrationError(product);

    if (!product || registrationError) {
      return Response.json(
        { error: registrationError?.message || 'This workshop or series could not be found.' },
        { status: registrationError?.status || 404 },
      );
    }

    if (!isPaidProduct(product)) {
      return Response.json(
        { error: 'This workshop or series does not require payment.' },
        { status: 400 },
      );
    }

    const unitAmount = getStripeUnitAmount(product);
    if (unitAmount <= 0) {
      return Response.json(
        { error: 'This price is not configured correctly.' },
        { status: 409 },
      );
    }

    const currency = getProductCurrency(product);
    const stripe = getStripe();
    const baseUrl = getBaseUrl(request);
    const registrationPath =
      input.productType === 'series'
        ? `/workshops/series/${input.slug}/register`
        : `/workshops/${input.slug}/register`;
    const successUrl = new URL(registrationPath, baseUrl);
    successUrl.searchParams.set('payment', 'success');
    successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
    const successUrlString = successUrl
      .toString()
      .replace('%7BCHECKOUT_SESSION_ID%7D', '{CHECKOUT_SESSION_ID}');
    const cancelUrl = new URL(registrationPath, baseUrl);
    cancelUrl.searchParams.set('payment', 'cancelled');

    const metadata: Record<string, string> = {
      email: input.email,
      name: input.name,
      productId: product._id,
      productType: input.productType,
      slug: input.slug,
      ...(input.productType === 'workshop' ? { workshopId: product._id } : {}),
    };

    const session = await stripe.checkout.sessions.create({
      client_reference_id: product._id,
      customer_email: input.email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: product.title || 'DiasporaSpot workshop',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata,
      mode: 'payment',
      payment_intent_data: {
        metadata,
      },
      success_url: successUrlString,
      cancel_url: cancelUrl.toString(),
    });

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL.');
    }

    return Response.json({ ok: true, url: session.url });
  } catch (reason) {
    console.error('Workshop checkout failed.', reason);
    return Response.json(
      { error: 'We could not start payment. Please try again.' },
      { status: 500 },
    );
  }
}
