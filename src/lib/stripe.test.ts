import assert from 'node:assert/strict';
import test from 'node:test';
import {
  validateStripeEventForEnvironment,
  validateStripeKeyForEnvironment,
} from './stripe';

test('staging accepts only Stripe test keys', () => {
  assert.doesNotThrow(() => validateStripeKeyForEnvironment('sk_test_example', 'staging'));
  assert.throws(
    () => validateStripeKeyForEnvironment('sk_live_example', 'staging'),
    /test-mode/,
  );
});

test('production accepts only Stripe live keys', () => {
  assert.doesNotThrow(() => validateStripeKeyForEnvironment('sk_live_example', 'production'));
  assert.throws(
    () => validateStripeKeyForEnvironment('sk_test_example', 'production'),
    /live-mode/,
  );
});

test('Stripe webhook mode must match the site environment', () => {
  assert.doesNotThrow(() => validateStripeEventForEnvironment(false, 'staging'));
  assert.doesNotThrow(() => validateStripeEventForEnvironment(true, 'production'));
  assert.throws(() => validateStripeEventForEnvironment(true, 'staging'), /does not match/);
  assert.throws(() => validateStripeEventForEnvironment(false, 'production'), /does not match/);
});
