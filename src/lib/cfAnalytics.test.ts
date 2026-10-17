import { test } from 'node:test';
import assert from 'node:assert/strict';
import { injectCfBeaconTag, isValidCfBeaconToken, renderCfBeaconTag } from './cfAnalytics.js';

const VALID_TOKEN = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';

test('isValidCfBeaconToken accepts 32 lowercase hex characters', () => {
  assert.equal(isValidCfBeaconToken(VALID_TOKEN), true);
});

test('isValidCfBeaconToken accepts uppercase hex characters', () => {
  assert.equal(isValidCfBeaconToken(VALID_TOKEN.toUpperCase()), true);
});

test('isValidCfBeaconToken rejects wrong lengths', () => {
  assert.equal(isValidCfBeaconToken(VALID_TOKEN.slice(0, 31)), false);
  assert.equal(isValidCfBeaconToken(`${VALID_TOKEN}0`), false);
  assert.equal(isValidCfBeaconToken(''), false);
});

test('isValidCfBeaconToken rejects non-hex characters', () => {
  assert.equal(isValidCfBeaconToken('g1b2c3d4e5f60718293a4b5c6d7e8f90'), false);
});

test('isValidCfBeaconToken rejects attempted HTML/script injection', () => {
  assert.equal(isValidCfBeaconToken('"></script><script>alert(1)</script>'), false);
  assert.equal(isValidCfBeaconToken(`${VALID_TOKEN}"><script>alert(1)</script>`), false);
});

test('renderCfBeaconTag renders the Cloudflare beacon script tag with the token', () => {
  const tag = renderCfBeaconTag(VALID_TOKEN);
  assert.equal(
    tag,
    `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${VALID_TOKEN}"}'></script>`,
  );
});

test('renderCfBeaconTag throws a clear error for an invalid token instead of rendering it', () => {
  assert.throws(() => renderCfBeaconTag('not-a-token'), /Invalid VITE_CF_ANALYTICS_TOKEN/);
  assert.throws(() => renderCfBeaconTag('"><script>alert(1)</script>'), /Invalid VITE_CF_ANALYTICS_TOKEN/);
});

test('injectCfBeaconTag inserts the beacon tag immediately before </body>', () => {
  const html = '<html><body><div id="root"></div></body></html>';
  const result = injectCfBeaconTag(html, VALID_TOKEN);
  assert.match(result, /<div id="root"><\/div>\s*<script defer src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js"/);
  assert.match(result, /<\/script>\s*<\/body><\/html>$/);
});

test('injectCfBeaconTag throws instead of modifying html when the token is invalid', () => {
  const html = '<html><body></body></html>';
  assert.throws(() => injectCfBeaconTag(html, 'bad-token'), /Invalid VITE_CF_ANALYTICS_TOKEN/);
});
