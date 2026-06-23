import { isValidEmail, subscribeToMailerLite } from '@/lib/mailerlite';
import { sanityClient } from '@/sanity/lib/client';

type RegistrationBody = {
  email?: unknown;
  name?: unknown;
  slug?: unknown;
  website?: unknown;
};

type RegistrationWorkshop = {
  bookingStatus?: string;
  mailerLiteGroupId?: string;
  mailerLiteProvisioningStatus?: string;
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
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const website = typeof body.website === 'string' ? body.website.trim() : '';

    if (website) {
      return Response.json({ ok: true });
    }

    if (!name || name.length > 120) {
      return Response.json({ error: 'Enter your name.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    if (!slug) {
      return Response.json({ error: 'Select a workshop.' }, { status: 400 });
    }

    const workshop = await sanityClient.fetch<RegistrationWorkshop | null>(
      `*[_type == "workshop" && status == "published" && slug.current == $slug][0]{
        bookingStatus,
        mailerLiteGroupId,
        mailerLiteProvisioningStatus
      }`,
      { slug },
    );

    if (!workshop) {
      return Response.json({ error: 'This workshop could not be found.' }, { status: 404 });
    }

    if (
      !workshop.mailerLiteGroupId ||
      workshop.mailerLiteProvisioningStatus !== 'ready'
    ) {
      return Response.json(
        { error: 'Registration is not available for this workshop yet.' },
        { status: 409 },
      );
    }

    await subscribeToMailerLite({
      email,
      name,
      groupIds: [workshop.mailerLiteGroupId],
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
