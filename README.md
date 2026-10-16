# Passdesk marketing homepage

A static, single-page marketing site for Passdesk. Plain HTML and CSS, a
system font stack, inline SVG for every icon and diagram, and no build step.

## Files

- `index.html` — the page.
- `styles.css` — all styling, including the light theme and a
  `prefers-color-scheme: dark` theme.
- `COPY-NOTES.md` — every factual claim on the page, with the shipped
  capability it's backed by (or its "Coming soon" label).

## Viewing it

No build step, no server required. Either:

- Open `index.html` directly in a browser (double-click it, or
  `open index.html` / `xdg-open index.html`), or
- Serve the folder locally and visit the printed URL, e.g.:

  ```bash
  python3 -m http.server 8000
  # then open http://localhost:8000/
  ```

There are no external network requests — fonts, icons and the diagram are
all inline or system-provided, so it also renders fully offline.

## Editing the copy

Everything is plain text in `index.html`; there's no templating or data
file to edit separately.

- **Headline / subhead / CTAs**: top of the `<section id="top" class="hero">`
  block.
- **Section headings**: each page section is a `<section>` with a `<h2>`
  near the top — search for the heading text to find it.
- **The denial example, the policy config snippet, and the log lines**:
  each lives in a `<pre class="code-block">...</pre>` block (the denial
  example and the policy snippet are wrapped in a `<figure>` with a
  `<figcaption>`). Keep the monospace formatting and column alignment,
  and keep only the existing highlight spans (`<span class="line-deny">`,
  `<span class="redacted">`, `<span class="code-comment">`) when editing
  these — don't introduce new inline markup, or the alignment and the
  dark/light theme colors will drift.
- **Integrations list**: the `<ul class="integration-strip">` in the
  "Works with your stack" section. Add or remove `<li>` items as plain
  text — no logos, per the brand rules in `COPY-NOTES.md`.
- **Roadmap / "Coming soon" items**: grouped in one `<p class="roadmap-note">`
  block, currently in the "Works with your stack" section. If you add a
  new roadmap item, add it there (and to `COPY-NOTES.md`) rather than
  scattering "Coming soon" labels across multiple sections.

After editing copy that makes a factual claim (anything about what
Passdesk actually does), update `COPY-NOTES.md` so the claim still maps to
a real, shipped capability — or is clearly labelled "Coming soon".

## Design notes

- Colors, spacing and type live entirely in `styles.css`; the dark theme
  is a second set of CSS custom properties under
  `@media (prefers-color-scheme: dark)` — there's no JS theme toggle.
- The layout is responsive down to ~400px width with no horizontal
  scrolling; breakpoints are in the `@media` rules at the bottom of
  `styles.css`. The code blocks (denial example, policy snippet, audit
  log) are the one exception: they scroll horizontally on purpose so the
  monospace alignment survives on narrow viewports instead of wrapping or
  shrinking illegibly. They're focusable (`tabindex="0"`) so keyboard
  users can scroll them too.
- All icons and the hero flow diagram are inline `<svg>` — decorative ones
  are `aria-hidden`, the hero diagram has a `<title>`/`<desc>` pair for
  screen readers.
