import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getMetaRequestContext,
  hasMetaAdvertisingConsent,
  normalizeMetaEventId,
  sanitizeMetaEventProperties,
  sanitizeMetaEventSourceUrl,
} from './meta-conversions-core';

test('advertising consent must be explicitly enabled', () => {
  const allowed = encodeURIComponent(JSON.stringify({ advertising: true, analytical: false }));
  const denied = encodeURIComponent(JSON.stringify({ advertising: false }));

  assert.equal(hasMetaAdvertisingConsent(`ds_cookie_consent=${allowed}`), true);
  assert.equal(hasMetaAdvertisingConsent(`ds_cookie_consent=${denied}`), false);
  assert.equal(hasMetaAdvertisingConsent(null), false);
  assert.equal(hasMetaAdvertisingConsent('ds_cookie_consent=not-json'), false);
});

test('event ids accept safe values and reject malformed input', () => {
  assert.equal(normalizeMetaEventId(' ds:CompleteRegistration:abc-123 '), 'ds:CompleteRegistration:abc-123');
  assert.equal(normalizeMetaEventId('spaces are not allowed'), '');
  assert.equal(normalizeMetaEventId('x'.repeat(101)), '');
});

test('request context reads browser matching data without changing it', () => {
  const request = new Request('https://diasporaspot.com/api/meta/events', {
    headers: {
      cookie: '_fbp=fb.1.123.456; _fbc=fb.1.123.click',
      'user-agent': 'DiasporaSpot test browser',
      'x-forwarded-for': '203.0.113.8, 10.0.0.1',
    },
  });

  assert.deepEqual(getMetaRequestContext(request), {
    clientIpAddress: '203.0.113.8',
    clientUserAgent: 'DiasporaSpot test browser',
    fbc: 'fb.1.123.click',
    fbp: 'fb.1.123.456',
  });
});

test('source URLs stay on the request host', () => {
  const requestUrl = 'https://diasporaspot.com/api/meta/events';

  assert.equal(
    sanitizeMetaEventSourceUrl('https://diasporaspot.com/workshops#details', requestUrl),
    'https://diasporaspot.com/workshops',
  );
  assert.equal(
    sanitizeMetaEventSourceUrl('https://attacker.example/path', requestUrl),
    'https://diasporaspot.com',
  );
});

test('custom data is allowlisted and bounded', () => {
  assert.deepEqual(
    sanitizeMetaEventProperties({
      content_ids: ['workshop-one'],
      content_name: 'Workshop One',
      ignored: 'do not forward',
      value: 25,
    }),
    {
      content_ids: ['workshop-one'],
      content_name: 'Workshop One',
      value: 25,
    },
  );
});
