// Cloudflare Web Analytics beacon: cookieless, page-views-only, no custom
// events. Injected at build time (see vite.config.ts) when
// VITE_CF_ANALYTICS_TOKEN is set; never run in dev. No SRI hash on the
// script tag: Cloudflare updates beacon.min.js in place without warning, so
// a pinned hash would break analytics the next time Cloudflare rolls one out.
const CF_BEACON_TOKEN_PATTERN = /^[0-9a-f]{32}$/i;

export function isValidCfBeaconToken(token: string): boolean {
  return CF_BEACON_TOKEN_PATTERN.test(token);
}

export function renderCfBeaconTag(token: string): string {
  if (!isValidCfBeaconToken(token)) {
    throw new Error(
      `[passdesk] Invalid VITE_CF_ANALYTICS_TOKEN "${token}": expected 32 hex characters (see .env.example).`,
    );
  }
  return `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${token}"}'></script>`;
}

export function injectCfBeaconTag(html: string, token: string): string {
  const tag = renderCfBeaconTag(token);
  return html.replace('</body>', `  ${tag}\n  </body>`);
}
