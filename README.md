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
- `src/config.ts` — `CONTACT_EMAIL`, used in the footer. It's a placeholder
  (`hello@passdesk.example`) and must be replaced before launch.
- `COPY-NOTES.md` — every claim on the page mapped to the shipped capability (S1–S8)
  or roadmap item (R1–R5) that backs it.

When editing copy that says what Passdesk does, update `COPY-NOTES.md` so the claim still
maps to a shipped capability, or is clearly listed under "Coming soon".

The example rules file and audit record in `UnderTheHood.tsx` are column-aligned
monospace text. Keep the spacing when you edit them.

## Sign-up form

See `src/components/WaitlistForm.tsx`. It is currently a visual stub: submitting does
nothing. The sign-up endpoint is configured in a later step.

## Hero demo

`src/components/DeskDemo.tsx` is a static illustration of requests going through the
desk. It will be animated in a later step.
