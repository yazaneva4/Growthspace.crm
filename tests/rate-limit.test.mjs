import test from 'node:test';
import assert from 'node:assert/strict';
import { tooManyRequests, clientIp } from '../src/lib/rate-limit.ts';

const req = (ip, realIp) => ({
  headers: { get: (name) => (name === 'x-forwarded-for' ? ip : name === 'x-real-ip' ? realIp ?? null : null) },
});

test('clientIp takes the first forwarded address', () => {
  assert.equal(clientIp(req('203.0.113.9, 70.41.3.18')), '203.0.113.9');
  assert.equal(clientIp(req('', '198.51.100.4')), '198.51.100.4');
  assert.equal(clientIp(req('')), 'unknown');
});

test('a client is allowed up to the limit and then throttled', () => {
  for (let i = 0; i < 3; i++) assert.equal(tooManyRequests(req('192.0.2.10'), 'unit-a', 3), false);
  assert.equal(tooManyRequests(req('192.0.2.10'), 'unit-a', 3), true);
});

test('limits are per endpoint and per client', () => {
  for (let i = 0; i < 2; i++) tooManyRequests(req('192.0.2.20'), 'unit-b', 2);
  assert.equal(tooManyRequests(req('192.0.2.20'), 'unit-b', 2), true);
  // A different endpoint, and a different client, start with fresh windows.
  assert.equal(tooManyRequests(req('192.0.2.20'), 'unit-c', 2), false);
  assert.equal(tooManyRequests(req('192.0.2.21'), 'unit-b', 2), false);
});

test('the window expires', () => {
  const ip = req('192.0.2.30');
  tooManyRequests(ip, 'unit-d', 1, 1);
  assert.equal(tooManyRequests(ip, 'unit-d', 1, 1), true);
  return new Promise((resolve) => setTimeout(() => {
    assert.equal(tooManyRequests(ip, 'unit-d', 1, 1), false);
    resolve();
  }, 10));
});
