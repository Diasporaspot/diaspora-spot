import type Stripe from 'stripe';
import {
  getRegistrationWorkshop,
  getWorkshopRegistrationError,
  registerWorkshopAttendee,
} from '@/lib/workshop-registration';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

async function registerPaidWorkshop(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') {
    return;
  }

  const email =
    session.metadata?.email ||
    session.customer_details?.email ||
    (typeof session.customer_email === 'string' ? session.customer_email : '');
  const name = session.metadata?.name || session.customer_details?.name || '';
  const slug = session.metadata?.slug || '';

  if (!email || !name || !slug) {
    console.error('Paid workshop checkout is missing registration metadata.', {
      sessionId: session.id,
    });
    return;
  }

  const workshop = await getRegistrationWorkshop(slug);
  const registrationError = getWorkshopRegistrationError(workshop);

  if (!workshop || registrationError) {
    throw new Error(registrationError?.message || 'This workshop could not be found.');
  }

  await registerWorkshopAttendee({ email, name, workshop });
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return Response.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured.');
    return Response.json({ error: 'Webhook is not configured.' }, { status: 500 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : 'Invalid webhook signature.';
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await registerPaidWorkshop(event.data.object);
    }

    return Response.json({ received: true });
  } catch (reason) {
    console.error('Stripe webhook registration failed.', reason);
    return Response.json({ error: 'Webhook handling failed.' }, { status: 500 });
  }
}
