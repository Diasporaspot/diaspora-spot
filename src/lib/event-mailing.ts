import 'server-only';
import { eventDatabase, canonicalId, type Booking } from './event-capacity';
import { getSiteEnvironment } from './site-environment';
import { findOrCreateMailerLiteGroup, subscribeToMailerLite, removeFromMailerLiteGroup } from './mailerlite';
import { registerProductAttendee, type RegistrationProduct } from './workshop-registration';

export type WaitlistEntry = {
  id: string; product_id: string; product_type: 'workshop' | 'series'; email: string; name: string;
  phone: string; state: string; sync_status: string; group_id: string | null;
};
// Staging never touches production mailing groups or subscribers by default.
// Only explicitly allowlisted test addresses may be sent to STAGING groups.
function stagingEmailAllowed(email: string) {
  return (process.env.EVENT_STAGING_EMAIL_ALLOWLIST || '').split(',').map(e => e.trim().toLowerCase()).includes(email.toLowerCase());
}
async function mark(table: string, id: string, values: Record<string, unknown>) {
  const { error } = await eventDatabase().from(table).update(values).eq('id', id).eq('environment', getSiteEnvironment());
  if (error) throw error;
}
export async function ensureWaitlistGroup(product: RegistrationProduct) {
  const db = eventDatabase(); const environment = getSiteEnvironment(); const productId = canonicalId(product._id);
  const { data, error } = await db.from('event_mailer_groups').select('*').eq('environment', environment).eq('product_id', productId).maybeSingle();
  if (error) throw error;
  if (data) return { id: data.group_id as string, name: data.group_name as string };
  const name = `${environment === 'staging' ? 'STAGING | ' : ''}Waitlist | ${product.title} | ${productId}`.slice(0,255);
  const group = await findOrCreateMailerLiteGroup(name);
  const saved = await db.from('event_mailer_groups').upsert({ environment, product_id: productId, group_id: group.id, group_name: group.name }, { onConflict: 'environment,product_id' });
  if (saved.error) throw saved.error;
  return group;
}
export async function syncWaitlist(entry: WaitlistEntry, product: RegistrationProduct) {
  try {
    if (getSiteEnvironment() === 'staging' && !stagingEmailAllowed(entry.email)) {
      await mark('event_waitlist', entry.id, { sync_status: 'staging_skipped', sync_error: null }); return;
    }
    const group = entry.group_id ? { id: entry.group_id } : await ensureWaitlistGroup(product);
    await mark('event_waitlist', entry.id, { group_id: group.id });
    if (entry.state === 'waiting') await subscribeToMailerLite({ email: entry.email, name: entry.name, groupIds: [group.id] });
    const { data, error } = await eventDatabase().from('event_waitlist').select('state').eq('id', entry.id).single();
    if (error) throw error;
    if (data.state === 'converted') await removeFromMailerLiteGroup(entry.email, group.id);
    await mark('event_waitlist', entry.id, { sync_status: 'synced', sync_error: null });
  } catch (error) {
    await mark('event_waitlist', entry.id, { sync_status: 'failed', sync_error: error instanceof Error ? error.message.slice(0,300) : 'MailerLite sync failed' });
  }
}
export async function syncBooking(booking: Booking, product: RegistrationProduct) {
  try {
    if (getSiteEnvironment() === 'staging' && stagingEmailAllowed(booking.email)) {
      const group = await findOrCreateMailerLiteGroup(`STAGING | Attendees | ${product.title} | ${canonicalId(product._id)}`.slice(0,255));
      await subscribeToMailerLite({ email: booking.email, name: booking.name, groupIds: [group.id] });
    } else {
      await registerProductAttendee({ email: booking.email, name: booking.name, phone: booking.phone, product,
        smsMarketingConsent: Boolean(booking.registration_data.smsMarketingConsent), smsConsentAt: booking.registration_data.smsConsentAt });
    }
    // Converting a series also removes the attendee from included workshop waitlists.
    const { data, error } = await eventDatabase().from('event_waitlist').update({ state: 'converted', sync_status: 'pending' })
      .eq('environment', getSiteEnvironment()).eq('email', booking.email)
      .in('product_id', [product, ...product.workshops].map(p => canonicalId(p._id))).select('*');
    if (error) throw error;
    for (const entry of (data || []) as WaitlistEntry[]) {
      // No need to create a new mailing group for a never-synced converted entry.
      if (!entry.group_id) await mark('event_waitlist', entry.id, { sync_status: 'synced', sync_error: null });
      else await syncWaitlist(entry, product);
    }
    await mark('event_bookings', booking.id, { sync_status: getSiteEnvironment() === 'staging' && !stagingEmailAllowed(booking.email) ? 'staging_skipped' : 'synced', sync_error: null });
  } catch (error) {
    await mark('event_bookings', booking.id, { sync_status: 'failed', sync_error: error instanceof Error ? error.message.slice(0,300) : 'MailerLite sync failed' });
  }
}
