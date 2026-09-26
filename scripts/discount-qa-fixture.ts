import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2025-06-02' });
async function main() {
  const id = 'discount-code-staging-qa';
  const date = new Date().toISOString().slice(0, 10);
  await client.createIfNotExists({
    _id: id,
    _type: 'workshop',
    status: 'staging',
    title: 'Discount Code Test Workshop',
    slug: { _type: 'slug', current: 'discount-code-test-workshop' },
    oneLiner: 'Staging-only workshop for testing discount codes.',
    description: 'Use SAVE20 for 20% off, TAKE5 for £5 off, or FREEPASS for a free booking. This event is only for testing.',
    date: '2026-12-31', time: '18:00', timezone: 'GMT+1', duration: '60 min',
    format: 'Online test', host: 'DiasporaSpot QA', spotsLabel: 'Test bookings', bookingStatus: 'booking-open',
    paymentType: 'paid', price: 25, currency: 'gbp', icon: 'calendar', iconTone: 'warm', ctaLabel: 'Reserve a seat', featured: false,
    discountCodes: [
      { _key: 'percent', code: 'SAVE20', type: 'percentage', value: 20, startDate: date, endMode: 'event' },
      { _key: 'amount', code: 'TAKE5', type: 'amount', value: 5, startDate: date, endMode: 'event' },
      { _key: 'free', code: 'FREEPASS', type: 'percentage', value: 100, startDate: date, endMode: 'event' },
      { _key: 'expired', code: 'EXPIRED', type: 'percentage', value: 20, startDate: '2026-01-01', endMode: 'date', endDate: '2026-01-02' },
      { _key: 'future', code: 'FUTURE', type: 'percentage', value: 20, startDate: '2026-12-30', endMode: 'event' },
    ],
  });
  await client.patch(id).set({ ctaLabel: 'Reserve a seat' }).commit();
  console.log('Staging-only discount test workshop is ready.');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
