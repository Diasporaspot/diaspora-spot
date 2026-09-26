import { transitionBooking } from '@/lib/event-capacity';
import { fulfillPaidPurchase } from '@/lib/paid-workshop';
import type Stripe from 'stripe';
import { getStripe, validateStripeEventForEnvironment } from '@/lib/stripe';
import { getSiteEnvironment } from '@/lib/site-environment';
export const runtime = 'nodejs';

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
    validateStripeEventForEnvironment(event.livemode, getSiteEnvironment());
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : 'Invalid webhook signature.';
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object;
      if (session.metadata?.bookingId && session.metadata.siteEnvironment !== getSiteEnvironment()) throw new Error('Booking environment mismatch.');
      if (session.metadata?.bookingId) await transitionBooking(session.metadata.bookingId, 'released', session.id);
    }
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      await fulfillPaidPurchase(event.data.object);
    }

    return Response.json({ received: true });
  } catch (reason) {
    console.error('Stripe webhook registration failed.', reason);
    return Response.json({ error: 'Webhook handling failed.' }, { status: 500 });
  }
}
