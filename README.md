# Passdesk marketing homepage

The launch page for Passdesk, the front desk for AI coding agents: a single-page
Vite + React + TypeScript site with plain CSS. Its job is to explain Passdesk in a
few seconds and collect early-access sign-ups.

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server with hot reload
npm run build      # type-check, then build the static site into dist/ (fails until launch config is set, see below)
npm run build:preview  # same build, allowed to run without launch config (for previews)
npm run preview    # serve the built dist/ locally
npm run typecheck  # tsc --noEmit only
npm test           # compile src/lib with tsc, then run its tests with node --test
```

The build output in `dist/` is fully static. At runtime it makes no external network
requests except the waitlist form's POST (see "Sign-up form") and, when configured,
the Cloudflare Web Analytics beacon (see "Analytics").

## Deployment

`.github/workflows/deploy.yml` builds and tests on every push and pull
request, and publishes `dist/` to GitHub Pages on pushes to `main`. The
repository's Pages source must be "GitHub Actions", with `passdesk.dev` as the
custom domain; DNS for the apex points at GitHub Pages' A and AAAA records and
`www` is a CNAME to `doomtickle.github.io`.

## Fonts

The design uses Schibsted Grotesk and JetBrains Mono, self-hosted via
`@fontsource-variable/schibsted-grotesk` and `@fontsource/jetbrains-mono`. Both are
installed and imported in `src/main.tsx`, so the fonts ship as part of the build
with no external network requests at runtime. `--font-sans` and `--font-mono` in
`src/styles/tokens.css` reference the font names those packages declare
(`'Schibsted Grotesk Variable'` and `'JetBrains Mono'`), falling back to system
fonts if a build ever omits the imports.

## Where things live

- `index.html` — page shell: title, meta description, Open Graph tags, theme color.
- `public/favicon.svg` — the key mark favicon.
- `src/App.tsx` — section order.
- `src/components/` — one component per section, each with its own CSS file. **The
  copy lives in these files**, e.g. `Hero.tsx`, `Problem.tsx` (comparison table rows),
  `HowItWorks.tsx` (steps and the refusal example), `UnderTheHood.tsx` (the example
  rules file and audit record), `Availability.tsx`, `Faq.tsx`.
- `src/styles/tokens.css` — design tokens: colors, type scale, spacing, radii, and the
  dark-mode overrides for the light sections.
- `src/styles/global.css` — base element styles, layout helpers, buttons, focus rings.
- `src/lib/waitlist.ts` — email validation and submission logic for the waitlist
  form, framework-free and unit-tested (`src/lib/waitlist.test.ts`).
- `src/lib/cfAnalytics.ts` — Cloudflare Web Analytics beacon token validation
  and tag rendering, unit-tested (`src/lib/cfAnalytics.test.ts`); injected at
  build time by `vite.config.ts` (see "Analytics").
- `src/config.ts` — `CONTACT_EMAIL` (`hello@passdesk.dev`), used in the footer
  and in the waitlist form's error states. The production build refuses to run
  while it is still the placeholder `PLACEHOLDER_CONTACT_EMAIL`.
- `COPY-NOTES.md` — every claim on the page mapped to the shipped capability (S1–S8)
  or roadmap item (R1–R5) that backs it.

When editing copy that says what Passdesk does, update `COPY-NOTES.md` so the claim still
maps to a shipped capability, or is clearly listed under "Coming soon".

The example rules file and audit record in `UnderTheHood.tsx` are column-aligned
monospace text. Keep the spacing when you edit them.

## Sign-up form

The waitlist form (`src/components/WaitlistForm.tsx`, submission logic in
`src/lib/waitlist.ts`) posts to whatever endpoint `VITE_WAITLIST_ENDPOINT` points
at. To configure it:

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_WAITLIST_ENDPOINT` to any endpoint that accepts a form POST and
   returns a 2xx status — [Formspree](https://formspree.io) and
   [Getform](https://getform.io) both work out of the box, e.g.
   `VITE_WAITLIST_ENDPOINT=https://formspree.io/f/your-form-id`.
3. Restart `npm run dev` (Vite only reads `.env*` files at startup).

The form POSTs `email`, `company` (if filled in) and `source` (`hero` or
`closing`) as `FormData`, with an `Accept: application/json` header.

It also has a honeypot field (`website`), hidden off-screen and unreachable by
keyboard or screen reader. Real visitors never see or fill it in; if it has a
value on submit, the request is silently dropped as a bot without ever
reaching the network.

If `VITE_WAITLIST_ENDPOINT` is unset, the form shows a message asking people to
email `CONTACT_EMAIL` directly instead of submitting.

## Launch guard

`npm run build` (or any non-development build mode) fails with a `[passdesk]
Refusing to build for mode "..."` message if either of these is still true:

- `VITE_WAITLIST_ENDPOINT` is unset (in `.env.local`, `.env.production` or the
  environment);
- `CONTACT_EMAIL` in `src/config.ts` is still the placeholder
  `hello@passdesk.example`.

The check lives in `vite.config.ts`. For previews and CI builds that don't need
to be launch-ready, run `npm run build:preview`, which sets
`PASSDESK_ALLOW_UNCONFIGURED=1`; it builds anyway and prints the same list as a
warning.

## Analytics

The built site optionally loads [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/),
which is cookieless, counts page views only, and defines no custom events. To
enable it:

1. Create a site at Cloudflare's dashboard under Analytics -> Web Analytics,
   and copy its beacon token (a 32-character hex string, not a secret — it
   ships in the page's HTML either way).
2. Set `VITE_CF_ANALYTICS_TOKEN` to that token in `.env.local` or
   `.env.production`.
3. Build (`npm run build` or `npm run build:preview`). `vite.config.ts`
   validates the token and, if it's set and valid, injects the beacon
   `<script>` tag before `</body>` in both `index.html` and `why/index.html`
   (`src/lib/cfAnalytics.ts`, unit-tested). The tag never appears in `npm run
   dev` and the token is never required — an unset token prints a build
   warning but doesn't fail the build.

The beacon script has no Subresource Integrity (SRI) hash. Cloudflare updates
`beacon.min.js` in place without warning, so a pinned hash would break
analytics the next time Cloudflare rolls out an update.

## Open Graph image

`public/og.svg` (1200×630) is the source for `public/og.png`, the `og:image`
referenced from `index.html`. It reuses the site's own tokens (the `--stage`
gradient, `--brass` / `--brass-text`, `--paper`) and the key mark from
`src/components/KeyMark.tsx`; the headline text is copied verbatim from
`src/components/Hero.tsx`.

[resvg](https://github.com/RazrFalcon/resvg) (via the `@resvg/resvg-wasm`
devDependency) renders the PNG, but it reads TTF/OTF sfnt data, not WOFF or
WOFF2 — and the site's fonts ship as `@fontsource` WOFF2 (the variable
Schibsted Grotesk) or WOFF/WOFF2 (JetBrains Mono, and the static
`@fontsource/schibsted-grotesk` devDependency used only for this image, for
the two static weights the headline needs). `scripts/og.mjs` decodes the
needed `.woff` files (WOFF1 is plain zlib) to in-memory TTF buffers and hands
them to resvg directly; it never touches WOFF2. Regenerate the PNG with:

```bash
npm run og
```

Re-check the result's dimensions are exactly 1200×630 and open the PNG to
confirm the text isn't clipped before committing it.

## Hero demo

`src/components/DeskDemo.tsx` animates requests going through the desk. The slips
and record lines are in `src/components/deskScript.ts`; the timing and "what is on
screen at each step" logic is in `src/lib/deskTimeline.ts` (unit-tested). It pauses
on hover, off-screen and in a hidden tab, has a pause button, and shows a still
frame when the visitor prefers reduced motion.
