import {
  getRegistrationWorkshop,
  getWorkshopRegistrationError,
  isPaidWorkshop,
  normalizeRegistrationInput,
  registerWorkshopAttendee,
  validateRegistrationInput,
} from '@/lib/workshop-registration';

type RegistrationBody = {
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

    const workshop = await getRegistrationWorkshop(input.slug);
    const registrationError = getWorkshopRegistrationError(workshop);

    if (!workshop || registrationError) {
      return Response.json(
        { error: registrationError?.message || 'This workshop could not be found.' },
        { status: registrationError?.status || 404 },
      );
    }

    if (isPaidWorkshop(workshop)) {
      return Response.json(
        { error: 'Payment is required before this workshop can be reserved.' },
        { status: 402 },
      );
    }

    await registerWorkshopAttendee({
      email: input.email,
      name: input.name,
      workshop,
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
