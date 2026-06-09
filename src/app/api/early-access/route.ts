import { isValidEmail, subscribeToMailerLite } from '@/lib/mailerlite';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      name?: unknown;
      website?: unknown;
    };

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const website = typeof body.website === 'string' ? body.website.trim() : '';

    if (website) {
      return Response.json({ ok: true });
    }

    if (!name) {
      return Response.json({ error: 'Enter your name.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    await subscribeToMailerLite({ email, name });

    return Response.json({ ok: true });
  } catch (reason) {
    const message =
      reason instanceof Error && reason.message.includes('MAILERLITE_API_KEY')
        ? reason.message
        : 'We could not save your spot right now. Please try again.';

    return Response.json({ error: message }, { status: 500 });
  }
}
