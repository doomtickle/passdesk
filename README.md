# Passdesk marketing homepage

The launch page for Passdesk, the front desk for AI coding agents: a single-page
Vite + React + TypeScript site with plain CSS. Its job is to explain Passdesk in a
few seconds and collect early-access sign-ups.

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server with hot reload
npm run build      # type-check, then build the static site into dist/
npm run preview    # serve the built dist/ locally
npm run typecheck  # tsc --noEmit only
npm test           # run src/lib tests with node --test
```

The build output in `dist/` is fully static. Fonts are bundled from npm
(`@fontsource-variable/schibsted-grotesk`, `@fontsource/jetbrains-mono`), so the page
makes no external network requests at runtime.

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
- `src/config.ts` — `CONTACT_EMAIL`, used in the footer and in the waitlist
  form's error states. It's a placeholder (`hello@passdesk.example`) and must
  be replaced before launch.
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
email `CONTACT_EMAIL` directly instead of submitting, and `vite build` prints a
warning (it does not fail the build) so this doesn't ship unnoticed.

## Hero demo

`src/components/DeskDemo.tsx` is a static illustration of requests going through the
desk. It will be animated in a later step.
