import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { getSiteEnvironment } from './site-environment';
import { getStripe } from './stripe';
import type { RegistrationInput } from './workshop-registration-core';
import type { RegistrationProduct } from './workshop-registration';

export const capacityEnabled = () => process.env.EVENT_CAPACITY_ENABLED === 'true';
export const canonicalId = (id: string) => id.replace(/^drafts\./, '');
export function eventDatabase() {
  const url = process.env.EVENT_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.EVENT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Event database is not configured.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export type Booking = {
  id: string; environment: string; product_id: string; product_type: 'workshop' | 'series';
  email: string; name: string; phone: string; state: 'held' | 'confirmed' | 'released';
  session_id: string | null; expires_at: string; created_at: string;
  sync_status: string; sync_error?: string;
  registration_data: { smsMarketingConsent?: boolean; smsConsentAt?: string };
};
export function eventRequirements(product: RegistrationProduct) {
  return [product, ...product.workshops].map((event) => ({
    id: canonicalId(event._id), capacity: event.capacity ?? null,
    closed: event.bookingStatus === 'closed' || ('salesStatus' in event && event.salesStatus === 'closed'),
    waitlist: event.bookingStatus === 'waitlist' || ('salesStatus' in event && event.salesStatus === 'waitlist'),
  }));
}
export async function transitionBooking(id: string, state: Booking['state'], sessionId: string | null) {
  const { data, error } = await eventDatabase().rpc('transition_event_booking', {
    p_environment: getSiteEnvironment(), p_id: id, p_state: state, p_session_id: sessionId,
  });
  if (error) throw error;
  return data as Booking;
}

// Reconcile missed/late webhooks before offering returned inventory. A completed session
// continues holding its seat until fulfillment, including asynchronous payments.
export async function reconcileHolds() {
  const db = eventDatabase();
  const { data, error } = await db.from('event_bookings').select('*')
    .eq('environment', getSiteEnvironment()).eq('state', 'held').lt('expires_at', new Date().toISOString()).limit(100);
  if (error) throw error;
  if (!data?.length) return;
  const stripe = getStripe();
  for (const booking of data as Booking[]) {
    let session: Stripe.Checkout.Session | undefined;
    if (booking.session_id) session = await stripe.checkout.sessions.retrieve(booking.session_id);
    else {
      // A network failure may hide a successful Stripe creation. Never release that seat
      // until a complete, bounded-time-window Stripe listing proves no session was created.
      const created = Math.floor(new Date(booking.created_at).getTime() / 1000);
      for await (const candidate of stripe.checkout.sessions.list({ created: { gte: created - 60, lte: Math.floor(new Date(booking.expires_at).getTime() / 1000) }, limit: 100 })) {
        if (candidate.metadata?.bookingId === booking.id) { session = candidate; break; }
      }
    }
    if (!session || session.status === 'expired') {
      await transitionBooking(booking.id, 'released', session?.id || booking.session_id);
    } else if (session.payment_status === 'paid' || (session.status === 'complete' && session.payment_status === 'no_payment_required')) {
      const { fulfillPaidPurchase } = await import('./paid-workshop');
      await fulfillPaidPurchase(session);
    } else if (!booking.session_id) {
      await transitionBooking(booking.id, 'held', session.id);
    }
  }
}
export async function getAvailability(product: RegistrationProduct) {
  const events = eventRequirements(product);
  const manualClosed = events.some(e => e.closed);
  const manualWaitlist = events.some(e => e.waitlist);
  if (!capacityEnabled()) {
    if (events.some(e => e.capacity !== null)) throw new Error('Capacity tracking is not enabled.');
    return { closed: manualClosed, full: manualWaitlist, remaining: null, confirmed: 0, held: 0 };
  }
  await reconcileHolds();
  const { data, error } = await eventDatabase().rpc('event_capacity_counts', { p_environment: getSiteEnvironment(), p_event_ids: events.map(e => e.id) });
  if (error) throw error;
  const counts = data as Array<{ event_id: string; confirmed: number; held: number; waiting: number }>;
  const remaining = events.filter(e => e.capacity !== null).map(e => {
    const count = counts.find(c => c.event_id === e.id)!;
    return Math.max(0, e.capacity! - count.confirmed - count.held);
  });
  const own = counts.find(c => c.event_id === canonicalId(product._id))!;
  return {
    closed: manualClosed, full: manualWaitlist || remaining.some(n => n === 0),
    remaining: remaining.length ? Math.min(...remaining) : null,
    confirmed: own.confirmed, held: own.held, waitingCount: own.waiting,
  };
}
export class CapacityError extends Error {
  constructor(public code: string) { super(code === 'full' ? 'This event is full. You can join the waiting list instead.' : code === 'existing_booking' ? 'This email already has a booking or an active checkout for this event. Complete that checkout or wait for it to expire.' : 'Registration is closed.'); }
}
export async function reserveSeats(product: RegistrationProduct, input: RegistrationInput, paid: boolean) {
  if (!capacityEnabled()) {
    const availability = await getAvailability(product);
    if (availability.closed || availability.full) throw new CapacityError(availability.closed ? 'closed' : 'full');
    return null;
  }
  await reconcileHolds();
  const { data, error } = await eventDatabase().rpc('reserve_event_seats', {
    p_environment: getSiteEnvironment(), p_product_id: canonicalId(product._id), p_product_type: input.productType,
    p_email: input.email, p_name: input.name, p_phone: input.phone,
    p_events: eventRequirements(product), p_paid: paid,
    p_data: { smsMarketingConsent: input.smsMarketingConsent, smsConsentAt: input.smsMarketingConsent ? new Date().toISOString() : undefined },
  });
  if (error) throw error;
  if (data.error) throw new CapacityError(data.error);
  return data as Booking;
}
