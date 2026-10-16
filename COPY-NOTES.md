# Copy notes

Every claim on the homepage, matched to the shipped capability that backs it.
Shipped capabilities are S1–S8; roadmap ("Coming soon") items are R1–R5. Copy
lives in `src/components/`; the file for each section is named below.

## Shipped capabilities (S1–S8)

- **S1** — Agents never hold your tokens. The GitHub token is injected by
  the egress proxy into the broker only; other credentials live in
  Passdesk's own secret store and are read fresh per call.
- **S2** — Agents can't reach the internet directly. Their only egress is
  through Passdesk, and Passdesk itself is held to an egress allowlist.
- **S3** — Each agent gets only its approved tools. A per-agent bearer
  token maps to a grant list; anything else is denied with a reason.
- **S4** — Policy limits what a tool can do: repo allowlist, protected
  branches, required branch prefix, package allow/deny lists, web host
  allowlist, size limits.
- **S5** — Outbound secret scanning blocks pushes and prompts that contain
  secrets. Inbound content is redacted, stripped of terminal escapes and
  wrapped as untrusted data.
- **S6** — Packages arrive as lockfile-pinned, hash-verified tarballs and
  wheels; no install scripts run in Passdesk.
- **S7** — Append-only audit record per call: time, agent, tool, redacted
  arguments, decision.
- **S8** — Tools available today: GitHub (fetch, push, open PR), npm,
  PyPI, web fetch, Jira, Gemini.

## Roadmap items (R1–R5)

- **R1** — Generic MCP adapter for any MCP agent (Claude Code, Codex,
  Cursor).
- **R2** — Tamper-evident hash-chained logs and SIEM sinks (syslog,
  webhook, OpenTelemetry).
- **R3** — Short-lived per-repo GitHub App tokens.
- **R4** — Human approval for risky actions.
- **R5** — Signed policy bundles and an admin API.

## Claim by claim

### Meta and header (`index.html`, `Header.tsx`)
- Title and Open Graph copy restate the hero; same backing as the hero lede.
- Wordmark, nav and "Request early access" button are structural.

### 1. Hero (`Hero.tsx`, `DeskDemo.tsx`)
- "Let your agents work. Keep the keys." — positioning line, not a fact.
- Lede: "push code, open pull requests and pull in packages" — **S8**;
  "with its own credentials" and "Your agents never hold your tokens." — **S1**
  (also in the meta and Open Graph descriptions);
  "by your rules" — **S3**/**S4**; "on the record" — **S7**.
- Desk illustration (captioned "Illustration"; slips and record lines in
  `deskScript.ts`): "No keys" chip and "Keys stay at the desk" (the matching
  key lights up on the rack but never moves to the agent) — **S1**; key tags
  GitHub, npm, PyPI, Jira, Web, Gemini — **S8**. Slips:
  - "Push branch agent/bump-deps to acme/web" and "Open a pull request: Bump
    deps", approved — **S8** (GitHub push, open PR) within **S4**.
  - "Push branch agent/fix-ci to acme/web", declined with "A secret turned up
    in the changes" — **S5**.
  - "Push straight to main on acme/web", declined with "main is a protected
    branch. Use a branch starting with agent/" — **S4** (protected branches,
    required branch prefix).
  - "Fetch acme/api from GitHub", approved — **S8** (GitHub fetch).
  - "Fetch @acme/ui-kit 2.4.1 from npm", approved — **S8** (npm) + **S6**.
  - "On the record" lines (time, agent, tool, decision) — **S7**; the tool
    names (`github.push`, `github.open_pr`, `github.fetch`, `npm.fetch`) are
    illustrative. Agent, repo and package names are placeholders.
- "We'll only email you about Passdesk early access." — a commitment about
  the sign-up list, not a product claim.

### 2. Problem (`Problem.tsx`)
- Body copy describes the baseline risk of handing an agent a token, not
  Passdesk.
- Table, "With Passdesk" column:
  - "Passdesk, which uses them on the agent's behalf" — **S1**.
  - "Only to Passdesk" — **S2**.
  - "Only the tools you approved, within your rules" — **S3** + **S4**.
  - "What you can see afterwards": "Every call, with its decision" — **S7**.
    The "Without" cell, "Only what each service happens to log", describes
    the baseline, not Passdesk.
- Body copy "leaves you no record of what the agent asked for" is the
  baseline; the contrast it sets up is **S7**.

### 3. How it works (`HowItWorks.tsx`)
- Step 1, "its own Passdesk token, never your credentials" — **S3** + **S1**.
- Step 2, repos/branches/packages/websites, "declined, with a reason" — **S4** (+ **S3** for the reason).
- Step 3, "It uses its own credentials, so they never reach the agent" — **S1**; "pinned
  to your lockfile and checked against their hashes, and no install scripts
  run" — **S6**.
- Step 4, "Outgoing pushes and prompts are scanned for secrets and blocked if
  one turns up", results "cleaned and marked as untrusted" — **S5**; "Every call goes on the record" — **S7**.
- "When the answer is no" example (push to main declined, hint to use a
  branch starting with `agent/`) — **S4** (protected branches, required
  branch prefix). Captioned "Illustration"; `acme/web` is a placeholder.

### 4. Audiences (`Audiences.tsx`)
- "For engineering": the tool list ("fetch and push code, open pull
  requests, pull packages from npm and PyPI, read the web, work in Jira and
  use Gemini") — **S8**; Jira and Gemini are named without specific actions
  because S8 lists them only by name; "hears why and can take the
  allowed route" — **S4** (reason and hint on a denial).
- "For security": "Approve each agent's tools once, in a config file that's
  reviewed like any other code change" — **S3**. Per-agent grant files
  reviewed like code is the brief's policy-as-code wording decision for S3; "see every call: when, which agent, which tool, the arguments with
  secrets redacted, and the decision" — **S7**.

### 5. Under the hood (`UnderTheHood.tsx`)
- Heading "See what your security team will see" and intro "Two files show
  how it works: the rules an agent works under, and the record of what it
  did." — **S3** (the rules file) + **S7** (the record); framing, not an
  exhaustive claim.
- "The rules": one file per agent in version control — **S3**; the example
  file's `repos`, `branches.protected`, `push_prefix`, `max_push_mb`,
  `npm.allow`/`deny`, `web_fetch.hosts`, `max_response_mb` — **S4**;
  `actions: [fetch, push, open_pr]` — **S8**. Captioned "illustrative,
  schema simplified"; all values are placeholders.
- "The record": "time, agent, tool, redacted arguments and the decision" —
  **S7**. Sample lines (captioned "illustrative, not captured output"): the
  "secret detected in diff" denial and `[REDACTED]` body — **S5**; the
  "protected branch" denial — **S4**; the `jira.comment` line is an
  illustrative example of a Jira call (**S8** Jira) with redaction (**S5**) —
  action name illustrative; no line carries a credential — **S1**.

### 6. Availability (`Availability.tsx`)
- "Works today" list — **S8**, the full list.
- "Coming soon" list — **R1**, **R2**, **R3**, **R4**, **R5**, in that order.
  This is the only place roadmap items are listed (the FAQ restates R1).

### 7. FAQ (`Faq.tsx`)
- GitHub token — **S1** + **S3**.
- Not allowed — **S4** + **S7**.
- Going around Passdesk — **S2**.
- Secret in a push or prompt — **S5**.
- "Will it work with Claude Code, Codex or Cursor?" — **R1**, explicitly
  labelled "coming soon".
- When can I try it — no product claim.

### 8. Closing and footer (`Closing.tsx`, `Footer.tsx`)
- "Passdesk holds the keys" — **S1**; "keeps the record" — **S7**.
- "© 2026 Passdesk" and the contact address (`CONTACT_EMAIL` in
  `src/config.ts`, a placeholder to replace before launch) — not claims.

## Things deliberately left out
- No "zero trust", "military-grade", padlock or shield imagery, robot
  imagery, customer logos, testimonials, quotes, "trusted by", or invented
  numbers or stats. The brand mark is a key, not a padlock.
- "Tools", never "skills".
- GitHub, npm, PyPI, Jira and Gemini appear only as plain text, never as
  logos, and never phrased as endorsements.
- No fake CLI transcript or terminal: the refusal example is a plain-language
  exchange, since no Passdesk CLI is a shipped product surface.
- No quickstart commands or package names: the quickstart ships at launch.
