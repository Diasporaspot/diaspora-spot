import {
  getRegistrationWorkshop,
  getStripeUnitAmount,
  getWorkshopCurrency,
  getWorkshopRegistrationError,
  isPaidWorkshop,
  normalizeRegistrationInput,
  validateRegistrationInput,
} from '@/lib/workshop-registration';
import { getStripe } from '@/lib/stripe';

type CheckoutBody = {
  email?: unknown;
  name?: unknown;
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

    const workshop = await getRegistrationWorkshop(input.slug);
    const registrationError = getWorkshopRegistrationError(workshop);

    if (!workshop || registrationError) {
      return Response.json(
        { error: registrationError?.message || 'This workshop could not be found.' },
        { status: registrationError?.status || 404 },
      );
    }

    if (!isPaidWorkshop(workshop)) {
      return Response.json(
        { error: 'This workshop does not require payment.' },
        { status: 400 },
      );
    }

    const unitAmount = getStripeUnitAmount(workshop);
    if (unitAmount <= 0) {
      return Response.json(
        { error: 'This workshop price is not configured correctly.' },
        { status: 409 },
      );
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl(request);
    const successUrl = new URL(`/workshops/${input.slug}/register`, baseUrl);
    successUrl.searchParams.set('payment', 'success');
    successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
    const cancelUrl = new URL(`/workshops/${input.slug}/register`, baseUrl);
    cancelUrl.searchParams.set('payment', 'cancelled');

    const metadata = {
      email: input.email,
      name: input.name,
      slug: input.slug,
      workshopId: workshop._id,
    };

    const session = await stripe.checkout.sessions.create({
      client_reference_id: workshop._id,
      customer_email: input.email,
      line_items: [
        {
          price_data: {
            currency: getWorkshopCurrency(workshop),
            product_data: {
              name: workshop.title || 'DiasporaSpot workshop',
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
      success_url: successUrl.toString(),
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
