import { getRegistrationProduct, getProductRegistrationError, normalizeRegistrationInput, validateRegistrationInput } from '@/lib/workshop-registration';
import { capacityEnabled, canonicalId, eventDatabase, eventRequirements, getAvailability, CapacityError } from '@/lib/event-capacity';
import { getSiteEnvironment } from '@/lib/site-environment';
import { syncWaitlist, type WaitlistEntry } from '@/lib/event-mailing';
const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: Request) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const now = Date.now();
  for (const [ip, item] of attempts) if (item.until < now) attempts.delete(ip);
  const attempt = attempts.get(key) || { count: 0, until: now + 600_000 };
  attempts.set(key, attempt); if (++attempt.count > 10) return Response.json({ error: 'Please try again later.' }, { status: 429 });
  try {
    if (!capacityEnabled()) return Response.json({ error: 'Waiting list is not available yet.' }, { status: 503 });
    const body = await request.json();
    if (body.website) return Response.json({ ok: true });
    const input = normalizeRegistrationInput(body);
    const validation = validateRegistrationInput(input);
    if (validation) return Response.json({ error: validation }, { status: 400 });
    const product = await getRegistrationProduct(input.productType, input.slug);
    const error = getProductRegistrationError(product);
    if (!product || error) return Response.json({ error: error?.message || 'Event not found' }, { status: error?.status || 404 });
    await getAvailability(product);
    const result = await eventDatabase().rpc('join_event_waitlist', {
      p_environment: getSiteEnvironment(), p_product_id: canonicalId(product._id), p_product_type: input.productType,
      p_email: input.email, p_name: input.name, p_phone: input.phone, p_events: eventRequirements(product),
    });
    if (result.error) throw result.error;
    if (result.data.error) return Response.json({ error: result.data.error === 'available' ? 'Seats are available again. Please continue with registration.' : new CapacityError(result.data.error).message, code: result.data.error }, { status: 409 });
    await syncWaitlist(result.data as WaitlistEntry, product);
    return Response.json({ ok: true, waitlisted: true });
  } catch (error) {
    console.error('Waitlist failed', error);
    return Response.json({ error: 'We could not save your waiting list request. Please try again.' }, { status: 500 });
  }
}
