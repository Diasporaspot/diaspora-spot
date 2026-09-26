import { transitionBooking } from '@/lib/event-capacity';
import { syncBooking } from '@/lib/event-mailing';
import type Stripe from 'stripe';
import {
  getProductRegistrationError,
  getRegistrationProductById,
  registerProductAttendee,
  type RegistrationProductType,
} from '@/lib/workshop-registration';
import { getSiteEnvironment } from '@/lib/site-environment';
import { normalizeMetaEventId } from '@/lib/meta-conversions-core';
import { sendMetaConversionSafely } from '@/lib/meta-conversions';

export async function fulfillPaidPurchase(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid' && !(session.payment_status === 'no_payment_required' && session.status === 'complete')) {
    return;
  }

  if (session.metadata?.bookingId && session.metadata.siteEnvironment !== getSiteEnvironment()) throw new Error('Booking environment mismatch.');

  const email =
    session.metadata?.email ||
    session.customer_details?.email ||
    (typeof session.customer_email === 'string' ? session.customer_email : '');
  const name = session.metadata?.name || session.customer_details?.name || '';
  const phone = session.metadata?.phone || session.customer_details?.phone || '';
  const smsMarketingConsent = session.metadata?.smsMarketingConsent === 'true';
  const productType: RegistrationProductType =
    session.metadata?.productType === 'series' ? 'series' : 'workshop';
  const productId = session.metadata?.productId || session.metadata?.workshopId || '';

  if (!email || !name || !productId) {
    throw new Error(`Paid ${productType} checkout is missing registration metadata.`);
  }

  const product = await getRegistrationProductById(productType, productId);
  const booking = session.metadata?.bookingId ? await transitionBooking(session.metadata.bookingId, 'confirmed', session.id) : null;
  const registrationError = booking ? null : getProductRegistrationError(product);

  if (!product || registrationError) {
    throw new Error(registrationError?.message || 'This workshop or series could not be found.');
  }

  if (booking) await syncBooking(booking, product);
  else await registerProductAttendee({
    email,
    name,
    phone,
    product,
    smsConsentAt: session.metadata?.smsConsentAt,
    smsMarketingConsent,
  });

  const metaEventId = normalizeMetaEventId(session.metadata?.metaEventId);
  if (metaEventId) {
    await sendMetaConversionSafely({
      eventId: metaEventId,
      eventName: 'CompleteRegistration',
      eventSourceUrl: session.metadata?.metaEventSourceUrl,
      properties: {
        content_category: 'Standard Series',
        content_ids: [session.metadata?.slug || productId],
        content_name: product.title || productType,
        content_type: productType,
        currency: session.currency || undefined,
        value: typeof session.amount_total === 'number' ? session.amount_total / 100 : undefined,
      },
      requestContext: {
        clientIpAddress: session.metadata?.metaClientIpAddress,
        clientUserAgent: session.metadata?.metaClientUserAgent,
        fbc: session.metadata?.metaFbc,
        fbp: session.metadata?.metaFbp,
      },
      userData: { email, name, phone },
    });
  }
}

