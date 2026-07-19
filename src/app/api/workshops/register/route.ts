import {
  getProductRegistrationError,
  getRegistrationProduct,
  isPaidProduct,
  normalizeRegistrationInput,
  registerProductAttendee,
  validateRegistrationInput,
} from '@/lib/workshop-registration';

type RegistrationBody = {
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

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return Response.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as RegistrationBody;
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

    if (isPaidProduct(product)) {
      return Response.json(
        { error: 'Payment is required before this workshop or series can be reserved.' },
        { status: 402 },
      );
    }

    await registerProductAttendee({
      email: input.email,
      name: input.name,
      product,
    });

    return Response.json({ ok: true });
  } catch (reason) {
    console.error('Workshop registration failed.', reason);
    return Response.json(
      { error: 'We could not complete your registration. Please try again.' },
      { status: 500 },
    );
  }
}
