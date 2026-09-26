import { getRegistrationProduct, getProductRegistrationError } from '@/lib/workshop-registration';
import { getAvailability } from '@/lib/event-capacity';
export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const product = await getRegistrationProduct(url.searchParams.get('productType') === 'series' ? 'series' : 'workshop', url.searchParams.get('slug') || '');
    const error = getProductRegistrationError(product);
    if (!product || error) return Response.json({ error: error?.message || 'Event not found' }, { status: error?.status || 404 });
    const availability = await getAvailability(product);
    return Response.json({ full: availability.full, closed: availability.closed, remaining: availability.remaining }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Availability failed', error);
    return Response.json({ error: 'Availability could not be checked. Please try again.' }, { status: 503 });
  }
}
