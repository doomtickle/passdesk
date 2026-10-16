// The placeholder address shipped until launch. The production build refuses
// to run while CONTACT_EMAIL still equals it (see vite.config.ts).
export const PLACEHOLDER_CONTACT_EMAIL = 'hello@passdesk.example';

// The public contact address on passdesk.dev. Mail to it must be routed
// somewhere real (e.g. Cloudflare Email Routing) before the site goes live.
export const CONTACT_EMAIL: string = 'hello@passdesk.dev';
