import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSiteEnvironment } from './site-environment';

test('an explicit site environment takes precedence', () => {
  assert.equal(
    resolveSiteEnvironment({
      nodeEnvironment: 'production',
      siteEnvironment: 'staging',
      vercelEnvironment: 'production',
    }),
    'staging',
  );
});

test('Vercel preview deployments use staging content', () => {
  assert.equal(
    resolveSiteEnvironment({
      nodeEnvironment: 'production',
      vercelEnvironment: 'preview',
    }),
    'staging',
  );
});

test('Vercel production deployments use production content', () => {
  assert.equal(
    resolveSiteEnvironment({
      nodeEnvironment: 'production',
      vercelEnvironment: 'production',
    }),
    'production',
  );
});

test('local development uses staging and an unknown production host fails closed', () => {
  assert.equal(resolveSiteEnvironment({ nodeEnvironment: 'development' }), 'staging');
  assert.equal(resolveSiteEnvironment({ nodeEnvironment: 'production' }), 'production');
});
