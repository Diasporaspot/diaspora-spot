import test from 'node:test';
import assert from 'node:assert/strict';
import { MemberDiscountError, requireMemberDiscountEligibility } from './member-discount-eligibility';
const user = { id: 'member-1', email: 'member@example.com' };
test('anonymous users must sign in even if eligibility is claimed', () => {
  assert.throws(() => requireMemberDiscountEligibility({ user: null, eligible: true }), (error: unknown) => error instanceof MemberDiscountError && error.signInRequired);
});
test('free, expired, and failed membership verification cannot grant discounts', () => {
  assert.throws(() => requireMemberDiscountEligibility({ user, eligible: false }), /active membership/);
  assert.throws(() => requireMemberDiscountEligibility({ user, eligible: true, verificationFailed: true }), /verify/);
});
test('eligible members may preview and book only with their verified account email', () => {
  assert.equal(requireMemberDiscountEligibility({ user, eligible: true }), user.id);
  assert.equal(requireMemberDiscountEligibility({ user, eligible: true, bookingEmail: 'MEMBER@example.com' }), user.id);
  assert.throws(() => requireMemberDiscountEligibility({ user, eligible: true, bookingEmail: 'someone@example.com' }), /member email/);
  assert.throws(() => requireMemberDiscountEligibility({ user: { id: user.id }, eligible: true }), /member email/);
});
