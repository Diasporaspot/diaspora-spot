import { sanityClient } from '@/sanity/lib/client';
import { getRegistrationProductById } from '@/lib/workshop-registration';
import { canonicalId, capacityEnabled, eventDatabase, getAvailability, type Booking } from '@/lib/event-capacity';
import { ensureWaitlistGroup, syncBooking, syncWaitlist, type WaitlistEntry } from '@/lib/event-mailing';
import { getSiteEnvironment } from '@/lib/site-environment';

function cors(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowed = (process.env.EVENT_ADMIN_ORIGINS || 'http://localhost:3333,http://127.0.0.1:3333').split(',').map(s => s.trim());
  return {
    ...(allowed.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store', Vary: 'Origin',
  };
}
export async function OPTIONS(request: Request) { return new Response(null, { status: 204, headers: cors(request) }); }
async function handle(request: Request) {
  const headers = cors(request);
  try {
    const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return Response.json({ error: 'Sign in to Sanity to view attendees.' }, { status: 401, headers });
    const client = sanityClient.withConfig({ token });
    const project = await client.projects.getById(client.config().projectId!);
    const member = project.members.find(m => m.isCurrentUser && !m.isRobot);
    const roles = member ? [member.role, ...((member as typeof member & { roles?: { name: string }[] }).roles || []).map(r => r.name)] : [];
    if (!member || !roles.some(role => ['administrator','editor','developer'].includes(role))) return Response.json({ error: 'An administrator or editor account is required.' }, { status: 403, headers });
    if (!capacityEnabled()) return Response.json({ error: 'Capacity tracking is not enabled for this environment.' }, { status: 503, headers });
    const url = new URL(request.url);
    const type = url.searchParams.get('productType') === 'series' ? 'series' : 'workshop';
    const id = canonicalId(url.searchParams.get('id') || '');
    const product = await getRegistrationProductById(type, id);
    if (!product || (getSiteEnvironment() === 'production' && product.status !== 'published')) return Response.json({ error: 'Event not found in this environment.' }, { status: 404, headers });
    const db = eventDatabase(); const environment = getSiteEnvironment();
    if (request.method === 'POST') {
      const body = await request.json();
      if (body.action === 'create-group') await ensureWaitlistGroup(product);
      else if (body.action === 'retry-email-updates') {
        const [bookings, waitlist] = await Promise.all([
          db.from('event_bookings').select('*').eq('environment', environment).eq('product_id', id)
            .eq('state', 'confirmed').eq('sync_status', 'failed').limit(100),
          db.from('event_waitlist').select('*').eq('environment', environment).eq('product_id', id)
            .eq('sync_status', 'failed').limit(100),
        ]);
        if (bookings.error || waitlist.error) throw bookings.error || waitlist.error;
        for (const booking of bookings.data as Booking[]) await syncBooking(booking, product);
        for (const entry of waitlist.data as WaitlistEntry[]) await syncWaitlist(entry, product);
      } else return Response.json({ error: 'Unknown action' }, { status: 400, headers });
    }
    const availability = await getAvailability(product);
    const [bookingIssues, waitlistIssues, group] = await Promise.all([
      db.from('event_bookings').select('*', { count: 'exact', head: true }).eq('environment', environment)
        .eq('product_id', id).eq('state', 'confirmed').eq('sync_status', 'failed'),
      db.from('event_waitlist').select('*', { count: 'exact', head: true }).eq('environment', environment)
        .eq('product_id', id).eq('sync_status', 'failed'),
      db.from('event_mailer_groups').select('group_id,group_name').eq('environment',environment).eq('product_id',id).maybeSingle(),
    ]);
    if (bookingIssues.error || waitlistIssues.error || group.error) throw bookingIssues.error || waitlistIssues.error || group.error;
    return Response.json({ environment, capacity: product.capacity ?? null, ...availability,
      emailUpdateIssues: (bookingIssues.count || 0) + (waitlistIssues.count || 0),
      group: group.data, updatedAt: new Date().toISOString() }, { headers });
  } catch (error) {
    console.error('Event admin request failed', error);
    return Response.json({ error: 'Could not load event administration. Check your Sanity access and event service configuration.' }, { status: 503, headers });
  }
}
export const GET = handle;
export const POST = handle;
