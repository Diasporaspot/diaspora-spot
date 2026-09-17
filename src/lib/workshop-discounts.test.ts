import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteDiscount, type DiscountCode } from './workshop-discounts';

const code: DiscountCode = { code: 'EARLY20', type: 'percentage', value: 20, startDate: '2026-09-15', endMode: 'event' };
const product = { price: 25.99, currency: 'usd', date: '2026-09-20', timezone: 'WAT', discountCodes: [code] };
const now = new Date('2026-09-15T12:00:00Z');
test('case-insensitive code and integer currency rounding', () => {
  assert.deepEqual(quoteDiscount(product, ' early20 ', now), { code: 'EARLY20', originalAmount: 2599, discountAmount: 520, amount: 2079 });
});
test('fixed discount uses event currency and cannot make price negative', () => {
  assert.equal(quoteDiscount({ ...product, discountCodes: [{ ...code, type: 'amount', value: 10 }] }, code.code, now).amount, 1599);
  assert.equal(quoteDiscount({ ...product, discountCodes: [{ ...code, type: 'amount', value: 30 }] }, code.code, now).amount, 0);
});
test('event-day expiry includes the whole local day', () => {
  assert.equal(quoteDiscount(product, code.code, new Date('2026-09-20T22:59:59Z')).amount, 2079);
  assert.throws(() => quoteDiscount(product, code.code, new Date('2026-09-20T23:00:00Z')), /expired/);
});
test('rejects future, expired, unknown, and malformed codes', () => {
  assert.throws(() => quoteDiscount(product, code.code, new Date('2026-09-14T12:00:00Z')), /not active/);
  assert.throws(() => quoteDiscount(product, 'OTHER', now), /not valid/);
  assert.throws(() => quoteDiscount({ ...product, discountCodes: [{ ...code, endMode: 'date', endDate: '2026-09-14' }] }, code.code, now), /configured/);
  assert.throws(() => quoteDiscount({ ...product, discountCodes: [{ ...code, value: 101 }] }, code.code, now), /configured/);
});
test('custom end date and full discount', () => {
  const custom = { ...product, discountCodes: [{ ...code, value: 100, endMode: 'date' as const, endDate: '2026-09-15' }] };
  assert.equal(quoteDiscount(custom, code.code, now).amount, 0);
  assert.throws(() => quoteDiscount(custom, code.code, new Date('2026-09-16T12:00:00Z')), /expired/);
  assert.equal(quoteDiscount(product, '', now).amount, 2599);
});
test('existing GMT offset event timezones respect local midnight', () => {
  const offsetProduct = { ...product, timezone: 'GMT+1' };
  assert.equal(quoteDiscount(offsetProduct, code.code, new Date('2026-09-14T23:00:00Z')).amount, 2079);
  assert.throws(() => quoteDiscount(offsetProduct, code.code, new Date('2026-09-20T23:00:00Z')), /expired/);
  assert.throws(() => quoteDiscount({ ...product, timezone: 'GMT+99' }, code.code, now), /timezone/);
});
test('malformed calendar dates fail closed', () => {
  assert.throws(() => quoteDiscount({ ...product, discountCodes: [{ ...code, startDate: '2026-02-31' }] }, code.code, now), /configured/);
});
