import type Stripe from 'stripe';
import {
  getProductRegistrationError,
  getRegistrationProductById,
  registerProductAttendee,
  type RegistrationProductType,
} from '@/lib/workshop-registration';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

async function fulfillPaidPurchase(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') {
    return;
  }

  const email =
    session.metadata?.email ||
    session.customer_details?.email ||
    (typeof session.customer_email === 'string' ? session.customer_email : '');
  const name = session.metadata?.name || session.customer_details?.name || '';
  const productType: RegistrationProductType =
    session.metadata?.productType === 'series' ? 'series' : 'workshop';
  const productId = session.metadata?.productId || session.metadata?.workshopId || '';

  if (!email || !name || !productId) {
    throw new Error(`Paid ${productType} checkout is missing registration metadata.`);
  }

  const product = await getRegistrationProductById(productType, productId);
  const registrationError = getProductRegistrationError(product);

  if (!product || registrationError) {
    throw new Error(registrationError?.message || 'This workshop or series could not be found.');
  }

  await registerProductAttendee({ email, name, product });
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
