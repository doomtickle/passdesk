# Passdesk site: working rules

This is the launch site for Passdesk (passdesk.dev): one static page, Vite +
React + TypeScript, plain CSS, deployed to GitHub Pages from `main` by
`.github/workflows/deploy.yml`. Pushing to `main` publishes.

- **Every claim on the page maps to a shipped capability.** `COPY-NOTES.md`
  lists the shipped capabilities (S1–S11), the roadmap items (R1–R6) and the
  Passdesk Pro beta items (P1–P2), and maps every sentence of copy to one of
  them. When you change copy that says what Passdesk does, update the map in
  the same change, or label the claim "coming soon". Never add invented
  numbers, testimonials, logos, "trusted by", or padlock/shield imagery.
- The product behind the copy is `../passdesk-broker` (the gateway, Apache
  2.0) and `../passdesk-pro` (approvals, commercial). Check a capability
  there before claiming it here.
- Commands: `npm test` (unit tests, `src/lib`), `npm run typecheck`,
  `npm run build` (refuses while the launch guard in `vite.config.ts`
  finds a placeholder; `npm run build:preview` builds anyway and warns).
- Design: tokens in `src/styles/tokens.css`, base styles and shared
  classes (`.section--dark`, `.card`, `.chip`, `.button`, `.eyebrow`) in
  `src/styles/global.css`, one CSS file per component. Keep brass as a
  line or a flat fill, never a glow; keep secondary text on dark surfaces at
  82% white or more, and body copy on light surfaces at 7:1 or better.
- Accessibility: real buttons, inputs with labels, a visible focus ring,
  `prefers-reduced-motion` honoured (the hero desk shows a still frame).
- Fonts are self-hosted via `@fontsource`; the built page makes no external
  requests at runtime except the waitlist form's POST to Formspree.
- `.env.production` holds the public Formspree form id; `CONTACT_EMAIL` is
  `hello@passdesk.dev`. Neither is a secret. Real secrets never go in this
  repo.
