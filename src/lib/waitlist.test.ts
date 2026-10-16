import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmail, submitWaitlist } from './waitlist.ts';

test('isValidEmail accepts well-formed addresses', () => {
  assert.equal(isValidEmail('name@company.com'), true);
  assert.equal(isValidEmail('  name@company.com  '), true);
  assert.equal(isValidEmail('first.last+tag@sub.domain.co'), true);
  assert.equal(isValidEmail('a@b.co'), true);
});

test('isValidEmail rejects malformed addresses', () => {
  assert.equal(isValidEmail(''), false);
  assert.equal(isValidEmail('   '), false);
  assert.equal(isValidEmail('name@company'), false);
  assert.equal(isValidEmail('@company.com'), false);
  assert.equal(isValidEmail('name@'), false);
  assert.equal(isValidEmail('name company.com'), false);
  assert.equal(isValidEmail('name@@company.com'), false);
  assert.equal(isValidEmail('name@.com'), false);
  assert.equal(isValidEmail(`${'a'.repeat(250)}@b.co`), false);
});

test('submitWaitlist rejects invalid email without fetching', async () => {
  let fetchCalled = false;
  const result = await submitWaitlist({
    endpoint: 'https://example.com/forms/abc',
    email: 'not-an-email',
    source: 'hero',
    fetchImpl: (async () => {
      fetchCalled = true;
      throw new Error('should not be called');
    }) as typeof fetch,
  });
  assert.deepEqual(result, { ok: false, reason: 'invalid_email' });
  assert.equal(fetchCalled, false);
});

test('submitWaitlist silently drops honeypot submissions without fetching', async () => {
  let fetchCalled = false;
  const result = await submitWaitlist({
    endpoint: 'https://example.com/forms/abc',
    email: 'name@company.com',
    source: 'hero',
    honeypot: 'i-am-a-bot',
    fetchImpl: (async () => {
      fetchCalled = true;
      throw new Error('should not be called');
    }) as typeof fetch,
  });
  assert.deepEqual(result, { ok: true });
  assert.equal(fetchCalled, false);
});

test('submitWaitlist returns not_configured without fetching when endpoint is missing', async () => {
  let fetchCalled = false;
  const fetchImpl = (async () => {
    fetchCalled = true;
    throw new Error('should not be called');
  }) as typeof fetch;

  const resultUndefined = await submitWaitlist({
    endpoint: undefined,
    email: 'name@company.com',
    source: 'hero',
    fetchImpl,
  });
  assert.deepEqual(resultUndefined, { ok: false, reason: 'not_configured' });

  const resultEmpty = await submitWaitlist({
    endpoint: '   ',
    email: 'name@company.com',
    source: 'closing',
    fetchImpl,
  });
  assert.deepEqual(resultEmpty, { ok: false, reason: 'not_configured' });

  assert.equal(fetchCalled, false);
});

test('submitWaitlist posts FormData with email, company, source and the Accept header on success', async () => {
  let capturedUrl: string | undefined;
  let capturedInit: RequestInit | undefined;

  const fetchImpl = (async (url: string | URL, init?: RequestInit) => {
    capturedUrl = String(url);
    capturedInit = init;
    return new Response(null, { status: 200 });
  }) as typeof fetch;

  const result = await submitWaitlist({
    endpoint: 'https://example.com/forms/abc',
    email: ' name@company.com ',
    company: 'Acme',
    source: 'closing',
    fetchImpl,
  });

  assert.deepEqual(result, { ok: true });
  assert.equal(capturedUrl, 'https://example.com/forms/abc');
  assert.equal(capturedInit?.method, 'POST');

  const headers = new Headers(capturedInit?.headers);
  assert.equal(headers.get('Accept'), 'application/json');

  const body = capturedInit?.body as FormData;
  assert.equal(body.get('email'), 'name@company.com');
  assert.equal(body.get('company'), 'Acme');
  assert.equal(body.get('source'), 'closing');
});

test('submitWaitlist returns server on a non-2xx response', async () => {
  const fetchImpl = (async () => new Response(null, { status: 500 })) as typeof fetch;

  const result = await submitWaitlist({
    endpoint: 'https://example.com/forms/abc',
    email: 'name@company.com',
    source: 'hero',
    fetchImpl,
  });

  assert.deepEqual(result, { ok: false, reason: 'server' });
});

test('submitWaitlist returns network when fetch throws', async () => {
  const fetchImpl = (async () => {
    throw new Error('boom');
  }) as typeof fetch;

  const result = await submitWaitlist({
    endpoint: 'https://example.com/forms/abc',
    email: 'name@company.com',
    source: 'hero',
    fetchImpl,
  });

  assert.deepEqual(result, { ok: false, reason: 'network' });
});

test('submitWaitlist returns network on timeout', async () => {
  const fetchImpl = ((_url: string | URL, init?: RequestInit) =>
    new Promise<Response>((resolve, reject) => {
      const signal = init?.signal;
      signal?.addEventListener('abort', () => {
        reject(new DOMException('aborted', 'AbortError'));
      });
    })) as typeof fetch;

  const result = await submitWaitlist({
    endpoint: 'https://example.com/forms/abc',
    email: 'name@company.com',
    source: 'hero',
    fetchImpl,
    timeoutMs: 20,
  });

  assert.deepEqual(result, { ok: false, reason: 'network' });
});
